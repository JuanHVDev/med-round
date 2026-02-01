/**
 * API Endpoint: POST /api/register
 * 
 * Registra un nuevo médico en el sistema MedRound.
 * 
 * Flujo simplificado gracias a la capa de servicios:
 * 1. Rate limiting por IP (protección contra abuso)
 * 2. Validación de datos con Zod schema
 * 3. Delegar a RegistrationService (transacciones atómicas con rollback)
 * 4. Retornar respuesta estandarizada con headers de rate limit
 * 
 * La lógica de negocio compleja (crear usuario + perfil + email) vive en
 * RegistrationService, permitiendo testing unitario y reutilización.
 * 
 * @module app/api/register/route
 */

import { NextRequest, NextResponse } from "next/server";
import type { ZodError } from "zod";
import { formSchema } from "@/lib/registerSchema";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { registrationService } from "@/services";
import {
  ErrorCodes,
  ZodValidationError,
  RateLimitError,
  formatErrorForLog,
  isZodValidationError,
} from "@/lib/errors";

/**
 * Maneja las peticiones POST para registro de nuevos médicos
 * 
 * @param request - Petición HTTP de Next.js con datos del formulario
 * @returns Respuesta JSON con resultado del registro o error estructurado
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ============================================================================
  // PASO 1: Rate Limiting por IP
  // ============================================================================
  // Extraemos la IP real considerando proxies (Vercel, CloudFlare, etc.)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor
    ? forwardedFor.split(",")[0]?.trim()
    : (request.headers.get("x-real-ip") ?? "unknown");

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
    // ============================================================================
    // PASO 2: Parsear y validar el cuerpo de la petición
    // ============================================================================
    const body = await request.json();
    const validatedData = parseAndValidateBody(body);

    // ============================================================================
    // PASO 3: Ejecutar registro via RegistrationService
    // ============================================================================
    // Delegamos toda la lógica compleja al servicio, que maneja:
    // - Creación de usuario con Better Auth
    // - Creación de perfil médico con Prisma
    // - Rollback automático si falla el perfil (cleanup del usuario)
    // - Envío de email de verificación (async, no bloqueante)
    const result = await registrationService.register(validatedData);

    if (!result.success) {
      // Error de negocio (duplicado, DB error, etc.) - ya viene estructurado
      const statusCode = getErrorStatusCode(result.error?.code ?? ErrorCodes.UNKNOWN_ERROR);
      return NextResponse.json(
        {
          error: result.error?.message ?? "Error en el registro",
          code: result.error?.code ?? ErrorCodes.UNKNOWN_ERROR,
        },
        {
          status: statusCode,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
        }
      );
    }

    // ============================================================================
    // PASO 4: Respuesta exitosa
    // ============================================================================
    return NextResponse.json(
      {
        success: true,
        userId: result.userId,
        message: "Registro exitoso. Por favor verifica tu email.",
      },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
      }
    );

  } catch (error) {
    // ============================================================================
    // MANEJO DE ERRORES INESPERADOS
    // ============================================================================
    return handleRegistrationError(error, rateLimit.remaining, rateLimit.resetTime);
  }
}

/**
 * Valida el cuerpo de la petición contra el schema Zod
 * 
 * @param body - Datos crudos de la petición HTTP
 * @returns Datos validados y tipados según RegistrationData
 * @throws {ZodValidationError} Si la validación falla
 */
function parseAndValidateBody(body: unknown) {
  try {
    return formSchema.parse(body);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      throw new ZodValidationError(error as ZodError);
    }
    throw error;
  }
}

/**
 * Mapea códigos de error a códigos HTTP estándar
 * 
 * @param code - Código de error interno de la aplicación
 * @returns Código HTTP correspondiente
 */
function getErrorStatusCode(code: string): number {
  const statusMap: Record<string, number> = {
    [ErrorCodes.USER_ALREADY_EXISTS]: 409,     // Conflict - duplicado
    [ErrorCodes.DUPLICATE_ERROR]: 409,         // Conflict - duplicado
    [ErrorCodes.VALIDATION_ERROR]: 400,        // Bad request
    [ErrorCodes.ZOD_VALIDATION_ERROR]: 400,    // Bad request
    [ErrorCodes.RATE_LIMIT_ERROR]: 429,        // Too many requests
  };

  return statusMap[code] ?? 500;  // 500 Internal Server Error por defecto
}

/**
 * Maneja errores inesperados durante el registro
 * 
 * Convierte diferentes tipos de error a respuestas HTTP consistentes
 * con logging estructurado para observabilidad.
 * 
 * @param error - Error capturado (de cualquier tipo)
 * @param rateLimitRemaining - Requests restantes para headers
 * @param rateLimitResetTime - Timestamp de reset para headers
 * @returns Respuesta HTTP con error estructurado
 */
function handleRegistrationError(
  error: unknown,
  rateLimitRemaining: number,
  rateLimitResetTime: number
): NextResponse {
  // Log estructurado del error para debugging y monitoreo
  console.error("❌ [Register] Error inesperado:", formatErrorForLog(error));

  // Errores de validación Zod (ya estructurados)
  if (isZodValidationError(error)) {
    const zodError = error as ZodValidationError;
    return NextResponse.json(
      {
        error: zodError.message,
        code: zodError.code,
        details: process.env.NODE_ENV === "development" ? zodError.zodIssues : undefined,
      },
      {
        status: 400,
        headers: getRateLimitHeaders(rateLimitRemaining, rateLimitResetTime),
      }
    );
  }

  // Error genérico de JavaScript
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: "Error en el proceso de registro. Por favor intenta de nuevo.",
        code: ErrorCodes.INTERNAL_ERROR,
      },
      {
        status: 500,
        headers: getRateLimitHeaders(rateLimitRemaining, rateLimitResetTime),
      }
    );
  }

  // Error completamente desconocido
  return NextResponse.json(
    {
      error: "Error desconocido en el servidor",
      code: ErrorCodes.UNKNOWN_ERROR,
    },
    {
      status: 500,
      headers: getRateLimitHeaders(rateLimitRemaining, rateLimitResetTime),
    }
  );
}
