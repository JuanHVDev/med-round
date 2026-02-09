import type { PrismaClient } from "@prisma/client";
import type { RegistrationData, RegistrationResult } from "../types/serviceTypes";
import type { IEmailService } from "../email/emailService";
import type { ErrorCode } from "@/lib/errors";
import {
  ErrorCodes,
  parseBetterAuthError,
  createUnknownError,
  isBetterAuthError,
} from "@/lib/errors";
import { sanitizeText, sanitizeEmail, sanitizeProfileData } from "@/lib/sanitize";

export interface IRegistrationService {
  register(data: RegistrationData): Promise<RegistrationResult>;
}

export interface AuthAPI {
  signUpEmail: (params: {
    body: {
      email: string;
      password: string;
      name: string;
    };
  }) => Promise<{ user: { id: string; name: string; email: string } } | null>;
}

export class RegistrationService implements IRegistrationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly auth: AuthAPI,
    private readonly emailService: IEmailService
  ) {}

  async register(data: RegistrationData): Promise<RegistrationResult> {
    let createdUserId: string | null = null;

    try {
      // Sanitizar datos de entrada para prevenir XSS
      const sanitizedData: RegistrationData = {
        ...data,
        fullName: sanitizeText(data.fullName),
        email: sanitizeEmail(data.email),
        professionalId: data.professionalId ? sanitizeText(data.professionalId) : undefined,
        universityMatricula: data.universityMatricula ? sanitizeText(data.universityMatricula) : undefined,
        hospital: sanitizeText(data.hospital),
        otherHospital: data.otherHospital ? sanitizeText(data.otherHospital) : undefined,
        specialty: sanitizeText(data.specialty),
      };

      const userResult = await this.createUser(sanitizedData);
      if (!userResult.success) {
        return {
          success: false,
          error: {
            code: userResult.error.code,
            message: userResult.error.message,
          },
        };
      }
      
      if (!userResult.userId) {
        return {
          success: false,
          error: {
            code: ErrorCodes.DATABASE_ERROR,
            message: "No se pudo obtener el ID del usuario creado",
          },
        };
      }

      createdUserId = userResult.userId;

      const profileResult = await this.createMedicalProfile(
        createdUserId,
        sanitizedData
      );
      if (!profileResult.success) {
        await this.cleanupUser(createdUserId);
        return {
          success: false,
          error: {
            code: profileResult.error.code,
            message: profileResult.error.message,
          },
        };
      }

      this.sendVerificationEmail(data.email).catch((error) => {
        console.error("❌ [RegistrationService] Failed to send verification email:", error);
      });

      return {
        success: true,
        userId: createdUserId,
      };
    } catch (error) {
      if (createdUserId) {
        await this.cleanupUser(createdUserId).catch(console.error);
      }

      return {
        success: false,
        error: createUnknownError(error),
      };
    }
  }

  private async createUser(data: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<
    | { success: true; userId: string }
    | { success: false; error: { code: ErrorCode; message: string } }
  > {
    try {
      const result = await this.auth.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.fullName,
        },
      });

      if (!result?.user?.id) {
        return {
          success: false,
          error: {
            code: ErrorCodes.DATABASE_ERROR,
            message: "No se pudo crear el usuario: respuesta inválida",
          },
        };
      }

      return {
        success: true,
        userId: result.user.id,
      };
    } catch (error) {
      if (isBetterAuthError(error)) {
        const parsedError = parseBetterAuthError(error);
        return {
          success: false,
          error: {
            code: parsedError.code,
            message: parsedError.message,
          },
        };
      }

      return {
        success: false,
        error: {
          code: ErrorCodes.DATABASE_ERROR,
          message: "Error al crear el usuario",
        },
      };
    }
  }

  private async createMedicalProfile(
    userId: string,
    data: {
      fullName: string;
      professionalId?: string;
      studentType?: string;
      universityMatricula?: string;
      hospital: string;
      otherHospital?: string;
      specialty: string;
      userType: string;
    }
  ): Promise<
    | { success: true }
    | { success: false; error: { code: ErrorCode; message: string } }
  > {
    try {
      // Si el hospital es "Otro", usar el valor de otherHospital
      const hospitalValue = data.hospital === "Otro" && data.otherHospital
        ? data.otherHospital
        : data.hospital;

      // Doble verificación de sanitización antes de guardar en BD
      const sanitizedProfile = sanitizeProfileData({
        fullName: data.fullName,
        hospital: hospitalValue,
        specialty: data.specialty,
        professionalId: data.professionalId,
        universityMatricula: data.universityMatricula,
      });

      await this.prisma.medicosProfile.create({
        data: {
          userId,
          fullName: sanitizedProfile.fullName,
          professionalId: sanitizedProfile.professionalId,
          studentType: data.studentType ?? null,
          universityMatricula: sanitizedProfile.universityMatricula,
          hospital: sanitizedProfile.hospital,
          otherHospital: data.otherHospital ? sanitizeText(data.otherHospital) : null,
          specialty: sanitizedProfile.specialty,
          userType: data.userType,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("❌ [RegistrationService] Profile creation failed:", error);

      // Detectar errores de constraint única (funciona tanto con mocks como con errores reales)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Unique constraint") || 
          errorMessage.includes("UNIQUE constraint") ||
          errorMessage.includes("already exists")) {
        return {
          success: false,
          error: {
            code: ErrorCodes.DUPLICATE_ERROR,
            message: "Este usuario ya tiene un perfil registrado",
          },
        };
      }

      return {
        success: false,
        error: {
          code: ErrorCodes.PROFILE_CREATION_ERROR,
          message: "Error al crear el perfil médico",
        },
      };
    }
  }

  private async cleanupUser(userId: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });
      console.log("✅ [RegistrationService] User cleanup successful");
    } catch (error) {
      console.error("⚠️ [RegistrationService] Failed to cleanup user:", error);
    }
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    const token = await this.generateVerificationToken(email);
    
    const result = await this.emailService.sendVerificationEmail(email, token);
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return;
  }

  private async generateVerificationToken(email: string): Promise<string> {
    return "mock-token-for-" + email;
  }
}

export const createRegistrationService = (
  prisma: PrismaClient,
  auth: AuthAPI,
  emailService: IEmailService
): IRegistrationService => {
  return new RegistrationService(prisma, auth, emailService);
};
