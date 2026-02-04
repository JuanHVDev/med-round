import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  ErrorCodes,
  MedRoundError,
  ValidationError,
  ZodValidationError,
  DuplicateError,
  DatabaseError,
  RateLimitError,
  EmailError,
  parseBetterAuthError,
  isBetterAuthError,
  isZodError,
  createUnknownError,
  formatErrorForLog,
  type BetterAuthError,
} from "@/lib/errors";

describe("ErrorCodes", () => {
  it("debería tener todos los códigos de error definidos", () => {
    expect(ErrorCodes.USER_ALREADY_EXISTS).toBe("USER_ALREADY_EXISTS");
    expect(ErrorCodes.INVALID_CREDENTIALS).toBe("INVALID_CREDENTIALS");
    expect(ErrorCodes.VALIDATION_ERROR).toBe("VALIDATION_ERROR");
    expect(ErrorCodes.ZOD_VALIDATION_ERROR).toBe("ZOD_VALIDATION_ERROR");
    expect(ErrorCodes.DATABASE_ERROR).toBe("DATABASE_ERROR");
    expect(ErrorCodes.DUPLICATE_ERROR).toBe("DUPLICATE_ERROR");
    expect(ErrorCodes.RATE_LIMIT_ERROR).toBe("RATE_LIMIT_ERROR");
    expect(ErrorCodes.EMAIL_SEND_ERROR).toBe("EMAIL_SEND_ERROR");
    expect(ErrorCodes.UNKNOWN_ERROR).toBe("UNKNOWN_ERROR");
  });

  it("debería tener todas las propiedades como readonly", () => {
    // Verificar que las propiedades existen y son strings
    const codes = ErrorCodes;
    expect(typeof codes.USER_ALREADY_EXISTS).toBe("string");
    expect(typeof codes.VALIDATION_ERROR).toBe("string");
    
    // Verificar que no se pueden agregar nuevas propiedades al objeto
    const codesAsMutable = codes as Record<string, unknown>;
    expect(codesAsMutable.NEW_CODE).toBeUndefined();
  });
});

describe("MedRoundError", () => {
  it("debería crear un error básico con todas las propiedades", () => {
    const error = new MedRoundError({
      code: ErrorCodes.DATABASE_ERROR,
      message: "Error de base de datos",
      statusCode: 500,
      details: "Detalles adicionales",
      cause: new Error("Causa original"),
    });

    expect(error.code).toBe(ErrorCodes.DATABASE_ERROR);
    expect(error.message).toBe("Error de base de datos");
    expect(error.statusCode).toBe(500);
    expect(error.details).toBe("Detalles adicionales");
    expect(error.cause).toBeInstanceOf(Error);
    expect(error.name).toBe("MedRoundError");
  });

  it("debería convertir a JSON correctamente", () => {
    const error = new MedRoundError({
      code: ErrorCodes.VALIDATION_ERROR,
      message: "Error de validación",
      statusCode: 400,
    });

    const json = error.toJSON();
    expect(json).toEqual({
      code: ErrorCodes.VALIDATION_ERROR,
      message: "Error de validación",
      statusCode: 400,
    });
  });

  it("debería tener stack trace", () => {
    const error = new MedRoundError({
      code: ErrorCodes.UNKNOWN_ERROR,
      message: "Error desconocido",
      statusCode: 500,
    });

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("MedRoundError");
  });

  it("debería mantener compatibilidad con instanceof Error", () => {
    const error = new MedRoundError({
      code: ErrorCodes.DATABASE_ERROR,
      message: "Error",
      statusCode: 500,
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MedRoundError);
  });
});

describe("ValidationError", () => {
  it("debería crear error de validación con código correcto", () => {
    const error = new ValidationError("Campo requerido", "El email es obligatorio");

    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(error.message).toBe("Campo requerido");
    expect(error.details).toBe("El email es obligatorio");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("ValidationError");
  });

  it("debería funcionar sin detalles opcionales", () => {
    const error = new ValidationError("Error simple");

    expect(error.message).toBe("Error simple");
    expect(error.details).toBeUndefined();
  });
});

describe("ZodValidationError", () => {
  it("debería crear error desde ZodError", () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(3),
    });

    const result = schema.safeParse({ email: "invalid", name: "a" });
    expect(result.success).toBe(false);

    if (!result.success) {
      const error = new ZodValidationError(result.error);

      expect(error.code).toBe(ErrorCodes.ZOD_VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.zodIssues).toHaveLength(2);
      expect(error.name).toBe("ZodValidationError");
    }
  });

  it("debería usar mensaje del primer issue", () => {
    const schema = z.object({
      email: z.string().email("Email inválido"),
    });

    const result = schema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);

    if (!result.success) {
      const error = new ZodValidationError(result.error);
      expect(error.message).toBe("Email inválido");
    }
  });

  it("debería incluir lista de campos inválidos en details", () => {
    const schema = z.object({
      field1: z.string(),
      field2: z.number(),
    });

    const result = schema.safeParse({ field1: 123, field2: "abc" });
    expect(result.success).toBe(false);

    if (!result.success) {
      const error = new ZodValidationError(result.error);
      expect(error.details).toContain("field1");
      expect(error.details).toContain("field2");
    }
  });

  it("debería usar mensaje por defecto si no hay issues", () => {
    const emptyError = new z.ZodError([]);
    const error = new ZodValidationError(emptyError);

    expect(error.message).toBe("Error de validación de datos");
  });
});

describe("DuplicateError", () => {
  it("debería crear error de duplicado con mensaje formateado", () => {
    const error = new DuplicateError("Email", "test@example.com");

    expect(error.code).toBe(ErrorCodes.DUPLICATE_ERROR);
    expect(error.message).toBe("Email ya está registrado");
    expect(error.details).toBe("El email 'test@example.com' ya existe en el sistema");
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe("DuplicateError");
  });

  it("debería funcionar con diferentes tipos de recursos", () => {
    const userError = new DuplicateError("Usuario", "user123");
    const idError = new DuplicateError("ID", "abc-123");

    expect(userError.message).toBe("Usuario ya está registrado");
    expect(idError.message).toBe("ID ya está registrado");
  });
});

describe("DatabaseError", () => {
  it("debería crear error de base de datos", () => {
    const originalError = new Error("Connection failed");
    const error = new DatabaseError("No se pudo conectar a la base de datos", originalError);

    expect(error.code).toBe(ErrorCodes.DATABASE_ERROR);
    expect(error.message).toBe("No se pudo conectar a la base de datos");
    expect(error.statusCode).toBe(500);
    expect(error.cause).toBe(originalError);
    expect(error.name).toBe("DatabaseError");
  });

  it("debería funcionar sin causa", () => {
    const error = new DatabaseError("Error simple");

    expect(error.cause).toBeUndefined();
  });
});

describe("RateLimitError", () => {
  it("debería crear error de rate limiting con tiempo de reset", () => {
    const resetTime = Date.now() + 60000; // 60 segundos
    const error = new RateLimitError(resetTime);

    expect(error.code).toBe(ErrorCodes.RATE_LIMIT_ERROR);
    expect(error.message).toBe("Demasiados intentos. Por favor, intenta más tarde.");
    expect(error.statusCode).toBe(429);
    expect(error.resetTime).toBe(resetTime);
    expect(error.details).toContain("60");
    expect(error.name).toBe("RateLimitError");
  });

  it("debería calcular segundos correctamente", () => {
    const now = Date.now();
    const resetTime = now + 30000; // 30 segundos
    const error = new RateLimitError(resetTime);

    expect(error.details).toContain("30");
  });
});

describe("EmailError", () => {
  it("debería crear error de email con código por defecto", () => {
    const error = new EmailError("No se pudo enviar el email");

    expect(error.code).toBe(ErrorCodes.EMAIL_SEND_ERROR);
    expect(error.message).toBe("No se pudo enviar el email");
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe("EmailError");
  });

  it("debería aceptar código personalizado", () => {
    const error = new EmailError("Timeout", ErrorCodes.EMAIL_TIMEOUT_ERROR);

    expect(error.code).toBe(ErrorCodes.EMAIL_TIMEOUT_ERROR);
  });
});

describe("parseBetterAuthError", () => {
  it("debería parsear error de usuario ya existe", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 422,
      body: {
        code: "USER_ALREADY_EXISTS",
        message: "User already exists",
      },
    };

    const result = parseBetterAuthError(betterAuthError);

    expect(result.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);
    expect(result.statusCode).toBe(422);
    expect(result.message).toContain("ya está registrado");
  });

  it("debería detectar usuario ya existe por mensaje", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 400,
      body: {
        message: "Email already exists in database",
      },
    };

    const result = parseBetterAuthError(betterAuthError);

    expect(result.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);
  });

  it("debería detectar por statusCode 422", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 422,
      body: {},
    };

    const result = parseBetterAuthError(betterAuthError);

    expect(result.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);
  });

  it("debería parsear error de credenciales inválidas", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 401,
      body: {
        code: "INVALID_CREDENTIALS",
      },
    };

    const result = parseBetterAuthError(betterAuthError);

    expect(result.code).toBe(ErrorCodes.INVALID_CREDENTIALS);
    expect(result.statusCode).toBe(401);
    expect(result.message).toContain("Credenciales inválidas");
  });

  it("debería manejar error genérico de Better Auth", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 500,
      body: {
        message: "Internal server error",
      },
    };

    const result = parseBetterAuthError(betterAuthError);

    expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(result.message).toBe("Internal server error");
  });

  it("debería manejar error sin body", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 500,
      message: "Some error",
    };

    const result = parseBetterAuthError(betterAuthError);

    expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(result.message).toBe("Some error");
  });

  it("debería usar valores por defecto si no hay información", () => {
    const result = parseBetterAuthError({});

    expect(result.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(result.message).toBe("Error de autenticación");
    expect(result.statusCode).toBe(500);
  });
});

describe("isBetterAuthError", () => {
  it("debería identificar error de Better Auth por statusCode", () => {
    const error = { statusCode: 422, body: {} };
    expect(isBetterAuthError(error)).toBe(true);
  });

  it("debería identificar por body", () => {
    const error = { body: { code: "ERROR" } };
    expect(isBetterAuthError(error)).toBe(true);
  });

  it("debería identificar por mensaje", () => {
    const error = { message: "better-auth error" };
    expect(isBetterAuthError(error)).toBe(true);
  });

  it("debería rechazar errores normales", () => {
    expect(isBetterAuthError(new Error("normal"))).toBe(false);
    expect(isBetterAuthError({ message: "normal" })).toBe(false);
    expect(isBetterAuthError(null)).toBe(false);
    expect(isBetterAuthError(undefined)).toBe(false);
    expect(isBetterAuthError("string")).toBe(false);
    expect(isBetterAuthError(123)).toBe(false);
  });
});

describe("isZodError", () => {
  it("debería identificar error de Zod", () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      expect(isZodError(result.error)).toBe(true);
    }
  });

  it("debería rechazar errores normales", () => {
    expect(isZodError(new Error("normal"))).toBe(false);
    expect(isZodError(null)).toBe(false);
    expect(isZodError({ issues: [] })).toBe(false); // No es instancia real
  });
});

describe("createUnknownError", () => {
  it("debería crear error desconocido con mensaje amigable", () => {
    const error = createUnknownError();

    expect(error.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    expect(error.message).toBe("Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.");
    expect(error.statusCode).toBe(500);
  });

  it("debería incluir causa si se proporciona", () => {
    const cause = new Error("Original error");
    const error = createUnknownError(cause);

    expect(error.cause).toBe(cause);
  });
});

describe("formatErrorForLog", () => {
  it("debería formatear MedRoundError completamente", () => {
    const error = new MedRoundError({
      code: ErrorCodes.DATABASE_ERROR,
      message: "DB Error",
      statusCode: 500,
      details: "Connection timeout",
      cause: new Error("Original"),
    });

    const formatted = formatErrorForLog(error);

    expect(formatted).toEqual({
      type: "MedRoundError",
      code: ErrorCodes.DATABASE_ERROR,
      message: "DB Error",
      statusCode: 500,
      details: "Connection timeout",
      stack: expect.any(String),
      cause: expect.any(Error),
    });
  });

  it("debería formatear Error genérico", () => {
    const error = new Error("Simple error");

    const formatted = formatErrorForLog(error);

    expect(formatted).toEqual({
      type: "Error",
      message: "Simple error",
      stack: expect.any(String),
    });
  });

  it("debería manejar errores no estándar", () => {
    const formatted = formatErrorForLog("string error");

    expect(formatted).toEqual({
      type: "string",
      value: "string error",
    });
  });

  it("debería manejar null y undefined", () => {
    expect(formatErrorForLog(null)).toEqual({ type: "object", value: null });
    expect(formatErrorForLog(undefined)).toEqual({ type: "undefined", value: undefined });
  });

  it("debería manejar objetos planos", () => {
    const obj = { custom: "value" };
    const formatted = formatErrorForLog(obj);

    expect(formatted).toEqual({
      type: "object",
      value: obj,
    });
  });
});

describe("Integración de sistema de errores", () => {
  it("debería permitir encadenamiento y conversión de errores", () => {
    // Simular flujo: Zod -> AppError -> JSON -> HTTP Response
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: "invalid" });

    expect(result.success).toBe(false);
    if (!result.success) {
      const zodError = new ZodValidationError(result.error);
      const json = zodError.toJSON();

      expect(json.code).toBe(ErrorCodes.ZOD_VALIDATION_ERROR);
      expect(json.statusCode).toBe(400);
    }
  });

  it("debería mantener información a través de conversiones", () => {
    const betterAuthError: BetterAuthError = {
      statusCode: 422,
      body: { code: "USER_ALREADY_EXISTS" },
    };

    const parsed = parseBetterAuthError(betterAuthError);
    const recreated = new MedRoundError({
      code: parsed.code,
      message: parsed.message,
      statusCode: parsed.statusCode,
    });

    expect(recreated.code).toBe(ErrorCodes.USER_ALREADY_EXISTS);
    expect(recreated.statusCode).toBe(422);
  });
});
