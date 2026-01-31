import { NextRequest, NextResponse } from 'next/server';
import type { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formSchema } from '@/lib/registerSchema';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import {
  ErrorCodes,
  type AppError,
  ZodValidationError,
  DatabaseError,
  RateLimitError,
  parseBetterAuthError,
  isBetterAuthError,
  isZodValidationError,
  isDatabaseError,
  createUnknownError,
  formatErrorForLog,
} from '@/lib/errors';

/**
 * POST /api/register
 * 
 * Registra un nuevo médico en el sistema.
 * 
 * Flujo:
 * 1. Rate limiting por IP
 * 2. Validación de datos con Zod
 * 3. Creación de usuario con Better Auth
 * 4. Creación de perfil médico con Prisma
 * 5. Manejo de errores estructurado
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // PASO 1: Rate limiting por IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor
    ? forwardedFor.split(',')[0]
    : (request.headers.get('x-real-ip') ?? 'unknown');

  const rateLimit = await checkRateLimit(`register:${ip}`);

  if (!rateLimit.allowed) {
    const error = new RateLimitError(rateLimit.resetTime);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      {
        status: error.statusCode,
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );
  }

  try {
    // PASO 2: Parsear y validar body
    const body = await request.json();
    const validatedData = parseAndValidateBody(body);

    // PASO 3: Crear usuario con Better Auth
    const user = await createUserWithBetterAuth(validatedData);

    // PASO 4: Crear perfil médico
    await createMedicalProfile(user.user.id, validatedData);

    // PASO 5: Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.user.id,
          name: user.user.name,
          email: user.user.email,
        },
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );
  } catch (error) {
    return handleRegistrationError(error, rateLimit.remaining, rateLimit.resetTime);
  }
}

/**
 * Parsea y valida el body de la petición usando Zod
 * 
 * @throws {ZodValidationError} Si la validación falla
 */
function parseAndValidateBody(body: unknown) {
  try {
    return formSchema.parse(body);
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      throw new ZodValidationError(error as ZodError);
    }
    throw error;
  }
}

/**
 * Crea un usuario usando Better Auth
 * 
 * @throws Error de Better Auth si el usuario ya existe o hay problemas de autenticación
 */
async function createUserWithBetterAuth(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  const user = await auth.api.signUpEmail({
    body: {
      email: data.email,
      password: data.password,
      name: data.fullName,
    },
  });

  if (!user?.user) {
    throw new DatabaseError('No se pudo crear el usuario: respuesta inválida de Better Auth');
  }

  return user;
}

/**
 * Crea el perfil médico del usuario
 * 
 * Si falla, elimina el usuario creado para evitar usuarios huérfanos
 * 
 * @throws {DatabaseError} Si no se puede crear el perfil o hacer cleanup
 */
async function createMedicalProfile(
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
) {
  try {
    await prisma.medicosProfile.create({
      data: {
        userId,
        fullName: data.fullName,
        professionalId: data.professionalId,
        studentType: data.studentType,
        universityMatricula: data.universityMatricula,
        hospital: data.hospital,
        otherHospital: data.otherHospital,
        specialty: data.specialty,
        userType: data.userType,
      },
    });
  } catch (profileError) {
    console.error('❌ [Register] Profile creation failed:', profileError);

    // Cleanup: eliminar usuario si el perfil falló
    await cleanupOrphanedUser(userId);

    throw new DatabaseError(
      'Error al crear el perfil médico',
      profileError
    );
  }
}

/**
 * Elimina un usuario huérfano (sin perfil)
 * 
 * @param userId - ID del usuario a eliminar
 */
async function cleanupOrphanedUser(userId: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    console.log('✅ [Register] User cleanup successful after profile error');
  } catch (cleanupError) {
    console.error('⚠️ [Register] Failed to cleanup user after profile error:', cleanupError);
    // No lanzamos error aquí para no perder el error original del profile
  }
}

/**
 * Maneja todos los errores del endpoint de registro
 * 
 * Convierte diferentes tipos de error a respuestas HTTP consistentes
 */
function handleRegistrationError(
  error: unknown,
  rateLimitRemaining: number,
  rateLimitResetTime: number
): NextResponse {
  // Log del error con formato estructurado
  console.error('❌ [Register] Registration error:', formatErrorForLog(error));

  let appError: AppError;

  // PASO 1: Identificar tipo de error
  // Nota: Usamos helper functions robustas para evitar problemas de módulos
  if (isBetterAuthError(error)) {
    // Error de Better Auth (ej: usuario ya existe)
    appError = parseBetterAuthError(error);
  } else if (isZodValidationError(error)) {
    // Error de validación Zod
    const zodError = error as ZodValidationError;
    appError = zodError.toJSON();
  } else if (isDatabaseError(error)) {
    // Error de base de datos
    const dbError = error as DatabaseError;
    appError = dbError.toJSON();
  } else if (error instanceof Error && error.message.includes('prisma')) {
    // Error específico de Prisma (ej: duplicado)
    if (error.message.includes('Unique constraint')) {
      appError = {
        code: ErrorCodes.DUPLICATE_ERROR,
        message: 'Este email ya está registrado',
        statusCode: 409,
      };
    } else {
      appError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Error de base de datos. Por favor, intenta de nuevo.',
        statusCode: 500,
      };
    }
  } else if (error instanceof Error) {
    // Error genérico de JavaScript
    appError = {
      code: ErrorCodes.UNKNOWN_ERROR,
      message: error.message || 'Error desconocido en el registro',
      statusCode: 500,
    };
  } else {
    // Error completamente desconocido
    appError = createUnknownError(error);
  }

  // PASO 2: Construir respuesta de error
  const responseBody: { error: string; code: string; details?: string } = {
    error: appError.message,
    code: appError.code,
  };

  // Agregar detalles solo en desarrollo
  if (process.env.NODE_ENV === 'development' && appError.details) {
    responseBody.details = appError.details;
  }

  // PASO 3: Enviar respuesta con headers de rate limit
  return NextResponse.json(responseBody, {
    status: appError.statusCode,
    headers: getRateLimitHeaders(rateLimitRemaining, rateLimitResetTime),
  });
}
