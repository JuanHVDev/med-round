import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock de la función send de Resend - hoisted para ejecutarse antes de imports
const mockResendSend = vi.hoisted(() => vi.fn());

// Mock del módulo 'resend' usando hoisted para evitar problemas de inicialización
vi.mock("resend", () => {
  // Retornamos una clase constructora que usa el mock hoisted
  function MockResend() {
    return {
      emails: {
        send: mockResendSend,
      },
    };
  }
  
  return {
    Resend: MockResend,
  };
});

// Importar el módulo a testear después de configurar los mocks
import { sendEmail } from "@/lib/email";

describe("Email Service", () => {
  const validEmailParams = {
    to: "usuario@ejemplo.com",
    subject: "Test Subject",
    text: "Test email content",
    html: "<p>Test email content</p>",
  };

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks();
    // Restaurar la API key para cada test
    process.env.RESEND_API_KEY = "test-api-key";
    process.env.EMAIL_FROM = "test@medround.app";
    process.env.EMAIL_FROM_NAME = "MedRound Test";
    // Restaurar timers reales
    vi.useRealTimers();
  });

  afterEach(() => {
    // Restaurar mocks después de cada test
    vi.restoreAllMocks();
  });

  describe("sendEmail", () => {
    /**
     * Test: Envío exitoso de email
     * 
     * Verifica que cuando Resend responde exitosamente, la función
     * devuelve success: true con los datos de la respuesta
     */
    it("debería enviar email exitosamente cuando Resend responde correctamente", async () => {
      // Configurar mock para simular éxito
      const mockResponse = { id: "email-123", message: "Email sent" };
      mockResendSend.mockResolvedValue({ data: mockResponse, error: null });

      // Ejecutar la función
      const result = await sendEmail(validEmailParams);

      // Verificaciones
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(result.error).toBeUndefined();
      expect(mockResendSend).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({
        to: [validEmailParams.to],
        subject: validEmailParams.subject,
        text: validEmailParams.text,
        html: validEmailParams.html,
      }));
    });

    /**
     * Test: Manejo de errores de la API de Resend
     * 
     * Verifica que cuando Resend devuelve un error en la respuesta,
     * la función maneja correctamente el error y devuelve success: false
     */
    it("debería manejar errores cuando Resend devuelve un error en la respuesta", async () => {
      // Configurar mock para simular error de Resend
      const mockError = { message: "Invalid API key" };
      mockResendSend.mockResolvedValue({ data: null, error: mockError });

      // Ejecutar la función
      const result = await sendEmail(validEmailParams);

      // Verificaciones
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid API key");
      expect(result.data).toBeUndefined();
    });

    /**
     * Test: Manejo cuando no hay API key configurada
     * 
     * Verifica que la función detecta cuando falta la API key
     * y devuelve un error apropiado sin intentar llamar a Resend
     */
    it("debería fallar si RESEND_API_KEY no está configurada", async () => {
      // Eliminar la API key
      delete process.env.RESEND_API_KEY;

      // Ejecutar la función
      const result = await sendEmail(validEmailParams);

      // Verificaciones
      expect(result.success).toBe(false);
      expect(result.error).toContain("Servicio de email no configurado");
      expect(mockResendSend).not.toHaveBeenCalled();
    });

    /**
     * Test: Manejo de timeout
     * 
     * Verifica que la función maneja correctamente cuando el envío
     * toma más tiempo que el timeout configurado (10 segundos)
     */
    it("debería manejar timeout cuando el envío tarda demasiado", async () => {
      // Usar timers fake para controlar el tiempo
      vi.useFakeTimers();
      
      // Configurar mock para que nunca resuelva (simula timeout)
      mockResendSend.mockImplementation(() => new Promise(() => {}));

      // Ejecutar la función
      const resultPromise = sendEmail(validEmailParams);
      
      // Avanzar el tiempo 10 segundos (el timeout)
      vi.advanceTimersByTime(10000);
      
      // Esperar a que la promesa se resuelva
      const result = await resultPromise;

      // Verificaciones
      expect(result.success).toBe(false);
      expect(result.error).toContain("Timeout");
      expect(result.error).toContain("10 segundos");
      
      // Restaurar timers reales
      vi.useRealTimers();
    });

    /**
     * Test: Manejo de errores de red/inesperados
     * 
     * Verifica que la función captura errores inesperados como
     * problemas de red, errores del servidor, etc.
     */
    it("debería manejar errores inesperados (network, servidor, etc.)", async () => {
      // Configurar mock para lanzar un error
      mockResendSend.mockRejectedValue(new Error("Network error"));

      // Ejecutar la función
      const result = await sendEmail(validEmailParams);

      // Verificaciones
      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
    });

    /**
     * Test: Uso de valores por defecto para el remitente
     * 
     * Verifica que cuando no hay variables de entorno configuradas
     * para el remitente, se usan los valores por defecto
     */
    it("debería usar valores por defecto cuando las variables de entorno del remitente no están configuradas", async () => {
      // Limpiar variables de entorno del remitente
      delete process.env.EMAIL_FROM;
      delete process.env.EMAIL_FROM_NAME;

      // Configurar mock para éxito
      mockResendSend.mockResolvedValue({ data: { id: "123" }, error: null });

      // Ejecutar la función
      await sendEmail(validEmailParams);

      // Verificar que se usaron valores por defecto
      expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({
        from: "MedRound <noreply@medround.app>",
      }));
    });

    /**
     * Test: Uso de HTML como fallback para text
     * 
     * Verifica que cuando no se proporciona HTML, se usa
     * automáticamente el contenido de texto
     */
    it("debería usar el contenido de texto como fallback cuando no hay HTML", async () => {
      const paramsWithoutHtml = {
        to: "test@ejemplo.com",
        subject: "Test",
        text: "Contenido de texto",
      };

      mockResendSend.mockResolvedValue({ data: { id: "123" }, error: null });

      await sendEmail(paramsWithoutHtml);

      expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({
        html: "Contenido de texto",
      }));
    });

    /**
     * Test: Formato correcto del remitente
     * 
     * Verifica que el remitente se formatea correctamente
     * en formato "Nombre <email@dominio.com>"
     */
    it("debería formatear correctamente el remitente con nombre y email", async () => {
      process.env.EMAIL_FROM_NAME = "Equipo MedRound";
      process.env.EMAIL_FROM = "soporte@medround.app";

      mockResendSend.mockResolvedValue({ data: { id: "123" }, error: null });

      await sendEmail(validEmailParams);

      expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({
        from: "Equipo MedRound <soporte@medround.app>",
      }));
    });
  });
});
