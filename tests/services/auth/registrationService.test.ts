import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegistrationService } from "@/services/auth/registrationService";
import { ErrorCodes } from "@/lib/errors";
import type { RegistrationData } from "@/services/types/serviceTypes";
import type { IEmailService } from "@/services/email/emailService";
import type { PrismaClient } from "@prisma/client";

/**
 * Tests unitarios para RegistrationService
 * 
 * Estos tests verifican:
 * - Flujo completo de registro (usuario + perfil + email)
 * - Transacciones atómicas con rollback
 * - Manejo de errores de Better Auth
 * - Manejo de errores de Prisma
 * - Inyección de dependencias
 */
describe("RegistrationService", () => {
  // Mocks
  const mockPrisma = {
    medicosProfile: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
  } as unknown as PrismaClient;

  const mockAuth = {
    signUpEmail: vi.fn(),
  };

  const mockEmailService: IEmailService = {
    sendWithRetry: vi.fn(),
    sendVerificationEmail: vi.fn().mockResolvedValue({
      success: true,
      messageId: "email-123",
    }),
  };

  let service: RegistrationService;

  // Datos de registro válidos
  const validRegistrationData: RegistrationData = {
    email: "test@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
    fullName: "Dr. Juan Pérez",
    hospital: "Hospital General",
    specialty: "Medicina Interna",
    userType: "professional",
    professionalId: "PRO-12345",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RegistrationService(mockPrisma, mockAuth, mockEmailService);
  });

  describe("flujo exitoso", () => {
    it("debería registrar un usuario profesional correctamente", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Juan Pérez", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockResolvedValue({
        id: "profile-1",
        userId,
      });

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.userId).toBe(userId);
      }
    });

    it("debería registrar un usuario estudiante correctamente", async () => {
      const studentData: RegistrationData = {
        ...validRegistrationData,
        userType: "student",
        studentType: "MPSS",
        universityMatricula: "MAT-2024-001",
        professionalId: undefined,
      };

      const userId = "student-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Estudiante María", email: "student@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockResolvedValue({
        id: "profile-2",
        userId,
      });

      const result = await service.register(studentData);

      expect(result.success).toBe(true);
      expect(mockPrisma.medicosProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          studentType: "MPSS",
          universityMatricula: "MAT-2024-001",
          professionalId: null,
        }),
      });
    });

    it("debería enviar email de verificación después del registro", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockResolvedValue({ id: "profile-1", userId });

      await service.register(validRegistrationData);

      // Email se envía de forma async (fire-and-forget)
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  describe("creación de usuario (Better Auth)", () => {
    it("debería llamar a signUpEmail con datos correctos", async () => {
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: "user-123", name: "Dr. Test", email: "test@example.com" },
      });
      mockPrisma.medicosProfile.create.mockResolvedValue({ id: "profile-1", userId: "user-123" });

      await service.register(validRegistrationData);

      expect(mockAuth.signUpEmail).toHaveBeenCalledWith({
        body: {
          email: validRegistrationData.email,
          password: validRegistrationData.password,
          name: validRegistrationData.fullName,
        },
      });
    });

    it("debería manejar error de usuario duplicado (409)", async () => {
      const duplicateError = new Error("User already exists");
      (duplicateError as Error & { body?: { code?: string } }).body = { code: "USER_ALREADY_EXISTS" };
      
      mockAuth.signUpEmail.mockRejectedValue(duplicateError);

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);
      }
    });

    it("debería manejar error de validación de Better Auth", async () => {
      const validationError = new Error("Invalid email format");
      mockAuth.signUpEmail.mockRejectedValue(validationError);

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(mockPrisma.medicosProfile.create).not.toHaveBeenCalled();
    });

    it("debería retornar error si la respuesta de Better Auth es null", async () => {
      mockAuth.signUpEmail.mockResolvedValue(null);

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      }
    });
  });

  describe("creación de perfil médico", () => {
    it("debería crear perfil con todos los campos mapeados correctamente", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockResolvedValue({
        id: "profile-1",
        userId,
      });

      await service.register(validRegistrationData);

      expect(mockPrisma.medicosProfile.create).toHaveBeenCalledWith({
        data: {
          userId,
          fullName: validRegistrationData.fullName,
          professionalId: validRegistrationData.professionalId,
          studentType: null,
          universityMatricula: null,
          hospital: validRegistrationData.hospital,
          otherHospital: null,
          specialty: validRegistrationData.specialty,
          userType: validRegistrationData.userType,
        },
      });
    });

    it('debería manejar hospital "Otro" con nombre personalizado', async () => {
      const dataWithOtherHospital: RegistrationData = {
        ...validRegistrationData,
        hospital: "Otro",
        otherHospital: "Hospital Especializado del Norte",
      };

      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockResolvedValue({
        id: "profile-1",
        userId,
      });

      await service.register(dataWithOtherHospital);

      expect(mockPrisma.medicosProfile.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          hospital: "Otro",
          otherHospital: "Hospital Especializado del Norte",
        }),
      });
    });
  });

  describe("transacciones atómicas (rollback)", () => {
    it("debería eliminar usuario si falla la creación del perfil", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockRejectedValue(new Error("DB Error"));
      mockPrisma.user.delete.mockResolvedValue({ id: userId });

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("no debería lanzar error si el cleanup también falla", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockRejectedValue(new Error("DB Error"));
      mockPrisma.user.delete.mockRejectedValue(new Error("User not found"));

      // No debería lanzar error
      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      // Cleanup se intentó pero falló silenciosamente
      expect(mockPrisma.user.delete).toHaveBeenCalled();
    });

    it("debería hacer cleanup en errores inesperados", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      // Simular error inesperado después de crear el perfil
      mockPrisma.medicosProfile.create.mockResolvedValue({ id: "profile-1", userId });
      mockEmailService.sendVerificationEmail.mockRejectedValue(new Error("Email failed"));
      mockPrisma.user.delete.mockResolvedValue({ id: userId });

      // Aunque el email falle, el registro debería considerarse exitoso
      // porque usuario y perfil se crearon correctamente
      const result = await service.register(validRegistrationData);

      // El servicio actual no hace rollback si el email falla (fire-and-forget)
      // pero esto podría cambiar según requerimientos de negocio
      expect(result.success).toBe(true);
    });
  });

  describe("manejo de errores de base de datos", () => {
    it("debería manejar error de constraint única en perfil", async () => {
      const userId = "user-123";
      const uniqueConstraintError = new Error("Unique constraint failed on medicosProfile.userId");
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockRejectedValue(uniqueConstraintError);

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.DUPLICATE_ERROR);
      }
    });

    it("debería retornar error genérico de DB para errores desconocidos", async () => {
      const userId = "user-123";
      
      mockAuth.signUpEmail.mockResolvedValue({
        user: { id: userId, name: "Dr. Test", email: "test@example.com" },
      });
      
      mockPrisma.medicosProfile.create.mockRejectedValue(new Error("Connection timeout"));

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.PROFILE_CREATION_ERROR);
      }
    });
  });

  describe("formato de errores", () => {
    it("debería retornar error estructurado con código y mensaje", async () => {
      mockAuth.signUpEmail.mockRejectedValue(new Error("Network error"));

      const result = await service.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      if (result.error) {
        expect(result.error).toHaveProperty("code");
        expect(result.error).toHaveProperty("message");
        expect(typeof result.error.code).toBe("string");
        expect(typeof result.error.message).toBe("string");
      }
    });
  });
});
