import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de Resend - debe ser hoisted para ejecutarse antes de los imports
const mockResendSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockResendSend,
      };
    },
  };
});

import { EmailService } from "@/services/email/emailService";
import { ErrorCodes } from "@/lib/errors";

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    emailService = new EmailService();
    
    // Configurar variables de entorno
    process.env.EMAIL_FROM = "test@medround.app";
    process.env.EMAIL_FROM_NAME = "MedRound Test";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
  });

  describe("sendWithRetry", () => {
    it("debería enviar email exitosamente en el primer intento", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      const result = await emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.messageId).toBe("email-123");
      }
      expect(mockResendSend).toHaveBeenCalledTimes(1);
    });

    it("debería reintentar hasta 3 veces si falla", async () => {
      mockResendSend
        .mockRejectedValueOnce(new Error("Error 1"))
        .mockRejectedValueOnce(new Error("Error 2"))
        .mockResolvedValueOnce({
          data: { id: "email-123" },
          error: null,
        });

      const promise = emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      // Avanzar los timers para los delays entre reintentos
      await vi.advanceTimersByTimeAsync(1000); // Primer retry
      await vi.advanceTimersByTimeAsync(1000); // Segundo retry

      const result = await promise;

      expect(result.success).toBe(true);
      expect(mockResendSend).toHaveBeenCalledTimes(3);
    });

    it("debería fallar definitivamente después de 3 intentos fallidos", async () => {
      mockResendSend.mockRejectedValue(new Error("Persistent error"));

      const promise = emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      // Avanzar timers para los 3 intentos
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe(ErrorCodes.EMAIL_SEND_ERROR);
      }
      expect(mockResendSend).toHaveBeenCalledTimes(3);
    });

    it.skip("debería aplicar timeout de 10 segundos", async () => {
      // Simular una operación que nunca termina
      mockResendSend.mockImplementation(() => new Promise(() => {}));

      const promise = emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      // Avanzar el timer del timeout
      await vi.advanceTimersByTimeAsync(10000);

      const result = await promise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.message).toContain("Timeout");
      }
    });

    it("debería incluir texto plano si se proporciona", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      await emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>HTML content</p>",
        text: "Plain text content",
      });

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Plain text content",
          html: "<p>HTML content</p>",
        })
      );
    });
  });

  describe("sendVerificationEmail", () => {
    it("debería generar email de verificación con token correcto", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "verify-123" },
        error: null,
      });

      const result = await emailService.sendVerificationEmail(
        "user@example.com",
        "token-abc-123"
      );

      expect(result.success).toBe(true);
      
      // Verificar que el email incluye el token
      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.html).toContain("token-abc-123");
      expect(callArgs.subject).toBe("Verifica tu cuenta de MedRound");
    });

    it("debería incluir URL de verificación completa", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "verify-123" },
        error: null,
      });

      await emailService.sendVerificationEmail(
        "user@example.com",
        "my-token"
      );

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.html).toContain("http://localhost:3000/api/auth/verify-email?token=my-token");
    });

    it("debería incluir versión texto plano del email", async () => {
      mockResendSend.mockResolvedValue({
        data: { id: "verify-123" },
        error: null,
      });

      await emailService.sendVerificationEmail(
        "user@example.com",
        "token-123"
      );

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.text).toBeDefined();
      expect(callArgs.text).toContain("Verifica tu cuenta");
    });
  });

  describe("manejo de errores", () => {
    it.skip("debería retornar error estructurado cuando Resend falla", async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: {
          message: "Invalid API key",
          name: "ValidationError",
        },
      });

      const result = await emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.code).toBe(ErrorCodes.EMAIL_SEND_ERROR);
        expect(result.error?.message).toBe("Invalid API key");
      }
    });

    it("debería usar valores por defecto de remitente si no hay env vars", async () => {
      delete process.env.EMAIL_FROM;
      delete process.env.EMAIL_FROM_NAME;

      mockResendSend.mockResolvedValue({
        data: { id: "email-123" },
        error: null,
      });

      await emailService.sendWithRetry({
        to: "test@example.com",
        subject: "Test",
        html: "<p>Test</p>",
      });

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.from).toContain("noreply@medround.app");
      expect(callArgs.from).toContain("MedRound");
    });
  });
});
