/**
 * Sistema de manejo de errores tipado para MedRound
 * 
 * Este módulo proporciona:
 * - Códigos de error constantes y tipados
 * - Clases de error específicas para diferentes escenarios
 * - Funciones de utilidad para crear y manejar errores
 * - Integración con Better Auth para errores de autenticación
 * 
 * Características:
 * - TypeScript strict: todos los errores están tipados, no hay `any`
 * - Extensible: fácil agregar nuevos códigos de error
 * - Testing-friendly: fácil de mockear y testear
 * - No reinventa la rueda: usa Better Auth nativo cuando aplica
 */

import { z } from 'zod';

/**
 * Códigos de error constantes para toda la aplicación
 * Usar estos en lugar de strings hardcodeados para consistencia
 */
export const ErrorCodes = {
  // Errores de autenticación (Better Auth)
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ZOD_VALIDATION_ERROR: 'ZOD_VALIDATION_ERROR',
  
  // Errores de base de datos
  DATABASE_ERROR: 'DATABASE_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  PROFILE_CREATION_ERROR: 'PROFILE_CREATION_ERROR',
  USER_CLEANUP_ERROR: 'USER_CLEANUP_ERROR',
  
  // Errores de rate limiting
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  
  // Errores de email
  EMAIL_SEND_ERROR: 'EMAIL_SEND_ERROR',
  EMAIL_TIMEOUT_ERROR: 'EMAIL_TIMEOUT_ERROR',
  
  // Errores generales
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/**
 * Tipo TypeScript para los códigos de error
 * Permite autocompletado y validación en tiempo de compilación
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Interfaz base para todos los errores de la aplicación
 * Proporciona estructura consistente para manejo de errores
 */
export interface AppError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: string;
  cause?: unknown;
}

/**
 * Error de aplicación con estructura tipada
 * Extiende Error nativo para stack traces y compatibilidad
 */
export class MedRoundError extends Error implements AppError {
  code: ErrorCode;
  statusCode: number;
  details?: string;
  cause?: unknown;

  constructor({
    code,
    message,
    statusCode,
    details,
    cause,
  }: Omit<AppError, 'code'> & { code: ErrorCode }) {
    super(message);
    this.name = 'MedRoundError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;
    
    // Mantener stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MedRoundError);
    }
  }

  /**
   * Convierte el error a formato JSON para respuestas API
   */
  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Error de validación específico
 * Usado cuando los datos de entrada no cumplen con el schema
 */
export class ValidationError extends MedRoundError {
  constructor(message: string, details?: string) {
    super({
      code: ErrorCodes.VALIDATION_ERROR,
      message,
      statusCode: 400,
      details,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Error de Zod para errores de validación de schema
 * Incluye información específica de Zod
 */
export class ZodValidationError extends MedRoundError {
  zodIssues: z.ZodIssue[];

  constructor(zodError: z.ZodError) {
    const firstIssue = zodError.issues[0];
    super({
      code: ErrorCodes.ZOD_VALIDATION_ERROR,
      message: firstIssue?.message || 'Error de validación de datos',
      statusCode: 400,
      details: `Campos inválidos: ${zodError.issues.map((issue: z.ZodIssue) => issue.path.join('.')).join(', ')}`,
    });
    this.name = 'ZodValidationError';
    this.zodIssues = zodError.issues;
  }
}

/**
 * Error de duplicado (email, ID, etc.)
 */
export class DuplicateError extends MedRoundError {
  constructor(resource: string, identifier: string) {
    super({
      code: ErrorCodes.DUPLICATE_ERROR,
      message: `${resource} ya está registrado`,
      statusCode: 409,
      details: `El ${resource.toLowerCase()} '${identifier}' ya existe en el sistema`,
    });
    this.name = 'DuplicateError';
  }
}

/**
 * Error de base de datos
 */
export class DatabaseError extends MedRoundError {
  constructor(message: string, cause?: unknown) {
    super({
      code: ErrorCodes.DATABASE_ERROR,
      message,
      statusCode: 500,
      cause,
    });
    this.name = 'DatabaseError';
  }
}

/**
 * Error de rate limiting
 */
export class RateLimitError extends MedRoundError {
  resetTime: number;

  constructor(resetTime: number) {
    const now = Date.now();
    const secondsRemaining = Math.max(0, Math.ceil((resetTime - now) / 1000));
    
    super({
      code: ErrorCodes.RATE_LIMIT_ERROR,
      message: 'Demasiados intentos. Por favor, intenta más tarde.',
      statusCode: 429,
      details: `Límite de peticiones alcanzado. Intenta de nuevo en ${secondsRemaining} segundos.`,
    });
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
}

/**
 * Error de email
 */
export class EmailError extends MedRoundError {
  constructor(message: string, code?: ErrorCode) {
    super({
      code: code || ErrorCodes.EMAIL_SEND_ERROR,
      message,
      statusCode: 500,
    });
    this.name = 'EmailError';
  }
}

/**
 * Tipo de error de Better Auth API
 * Basado en la estructura real de errores de Better Auth
 */
export interface BetterAuthError {
  statusCode?: number;
  body?: {
    message?: string;
    code?: string;
  };
  message?: string;
}

/**
 * Convierte un error de Better Auth a AppError
 * Preserva el código de error original cuando sea posible
 */
export function parseBetterAuthError(error: unknown): AppError {
  const authError = error as BetterAuthError;
  
  // Extraer código de error de Better Auth
  const errorCode = authError.body?.code || '';
  const errorMessage = authError.body?.message || authError.message || 'Error de autenticación';
  const statusCode = authError.statusCode || 500;
  
  // Mapear códigos específicos de Better Auth
  if (errorCode.includes('USER_ALREADY_EXISTS') || 
      errorMessage.includes('already exists') ||
      statusCode === 422) {
    return {
      code: ErrorCodes.USER_ALREADY_EXISTS,
      message: 'Este email ya está registrado. Por favor, usa otro email o inicia sesión.',
      statusCode: 422,
    };
  }
  
  if (errorCode.includes('INVALID_CREDENTIALS')) {
    return {
      code: ErrorCodes.INVALID_CREDENTIALS,
      message: 'Credenciales inválidas. Por favor, verifica tus datos.',
      statusCode: 401,
    };
  }
  
  // Error genérico de Better Auth
  return {
    code: ErrorCodes.INTERNAL_ERROR,
    message: errorMessage,
    statusCode,
  };
}

/**
 * Verifica si un error es de tipo Better Auth
 */
export function isBetterAuthError(error: unknown): error is BetterAuthError {
  if (typeof error !== 'object' || error === null) return false;
  
  const e = error as BetterAuthError;
  return (
    typeof e.statusCode === 'number' ||
    typeof e.body === 'object' ||
    (typeof e.message === 'string' && e.message.includes('better-auth'))
  );
}

/**
 * Verifica si un error es de Zod
 */
export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}

/**
 * Verifica si un error es de tipo ZodValidationError
 * Usa name check para evitar problemas de módulos
 */
export function isZodValidationError(error: unknown): error is ZodValidationError {
  return (
    error instanceof ZodValidationError ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'ZodValidationError')
  );
}

/**
 * Verifica si un error es de tipo DatabaseError
 * Usa name check para evitar problemas de módulos
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof DatabaseError ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name: string }).name === 'DatabaseError')
  );
}

/**
 * Crea un error genérico para casos inesperados
 */
export function createUnknownError(cause?: unknown): AppError {
  return {
    code: ErrorCodes.UNKNOWN_ERROR,
    message: 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.',
    statusCode: 500,
    cause,
  };
}

/**
 * Formatea un error para logging con información estructurada
 */
export function formatErrorForLog(error: unknown): Record<string, unknown> {
  if (error instanceof MedRoundError) {
    return {
      type: error.name,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
      cause: error.cause,
    };
  }
  
  if (error instanceof Error) {
    return {
      type: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  
  return {
    type: typeof error,
    value: error,
  };
}
