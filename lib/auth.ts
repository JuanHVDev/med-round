import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

/**
 * Configuración del sistema de reintentos para emails
 * MAX_RETRIES: Número máximo de intentos antes de dar por fallido
 * RETRY_DELAY_MS: Tiempo de espera entre intentos (1 segundo)
 */
const EMAIL_RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Resultado del envío de email con reintentos
 */
interface EmailSendResult
{
  success: boolean;
  error?: string;
  attempts: number;
}

/**
 * Envía un email con sistema de reintentos automáticos
 * 
 * Esta función intenta enviar el email hasta 3 veces:
 * 1. Primer intento inmediato
 * 2. Segundo intento después de 1 segundo si falla
 * 3. Tercer intento después de 1 segundo más si falla
 * 
 * Si todos los intentos fallan, devuelve un error detallado.
 * 
 * @param to - Email del destinatario
 * @param subject - Asunto del email
 * @param text - Contenido en texto plano
 * @param html - Contenido en HTML
 * @returns Promise<EmailSendResult> - Resultado con información de intentos
 */
async function sendEmailWithRetry(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<EmailSendResult> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= EMAIL_RETRY_CONFIG.MAX_RETRIES; attempt++) {
    console.log(`📧 [Email Retry] Intento ${attempt}/${EMAIL_RETRY_CONFIG.MAX_RETRIES} para: ${to}`);

    try {
      const result = await sendEmail({ to, subject, text, html });

      if (result.success) {
        console.log(`✅ [Email Retry] Éxito en intento ${attempt} para: ${to}`);
        return { success: true, attempts: attempt };
      }

      lastError = result.error || "Error desconocido";
      console.warn(`⚠️ [Email Retry] Intento ${attempt} falló: ${lastError}`);

      if (attempt < EMAIL_RETRY_CONFIG.MAX_RETRIES) {
        console.log(`⏱️ [Email Retry] Esperando ${EMAIL_RETRY_CONFIG.RETRY_DELAY_MS}ms antes del siguiente intento...`);
        await new Promise((resolve) => setTimeout(resolve, EMAIL_RETRY_CONFIG.RETRY_DELAY_MS));
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Error inesperado";
      console.error(`❌ [Email Retry] Error inesperado en intento ${attempt}:`, lastError);

      if (attempt < EMAIL_RETRY_CONFIG.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, EMAIL_RETRY_CONFIG.RETRY_DELAY_MS));
      }
    }
  }

  console.error(`🚫 [Email Retry] Todos los intentos fallaron para: ${to}`);
  return {
    success: false,
    error: lastError || "No se pudo enviar el email después de múltiples intentos",
    attempts: EMAIL_RETRY_CONFIG.MAX_RETRIES,
  };
}

/**
 * Configuración principal de Better Auth
 * Incluye: base de datos, email/password, verificación de email, sesiones
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  /**
   * Configuración de email y password
   * - Habilitado: true
   * - Requiere verificación de email: true (usuarios deben verificar antes de usar)
   * - No iniciar sesión automáticamente después de registro (deben verificar primero)
   * - Longitud mínima de contraseña: 8 caracteres
   * - Longitud máxima de contraseña: 128 caracteres
   */
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  /**
   * Configuración de verificación de email
   * - Enviar email al registrarse: true
   * - Iniciar sesión automáticamente después de verificar: true
   * - Callback personalizado para enviar emails con sistema de reintentos
   */
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,

    /**
     * Función para enviar el email de verificación
     * 
     * Esta función se ejecuta automáticamente cuando un usuario se registra.
     * Implementa un sistema de reintentos para garantizar que el email se envíe
     * incluso si hay problemas temporales de red o con el servicio.
     * 
     * @param user - Datos del usuario (id, email, name)
     * @param url - URL de verificación que debe clickear el usuario
     * @param token - Token de verificación (no se usa directamente, usa la URL)
     * @param request - Request object de Next.js (no se usa actualmente)
     */
    sendVerificationEmail: async ({ user, url, token }, request) =>
    {
      console.log(`🔄 [Auth] Iniciando envío de email de verificación para: ${user.email}`);

      // Construir el contenido del email
      const subject = "Verifica tu email - MedRound";
      const text = `Hola ${user.name},\n\nPor favor verifica tu email haciendo clic en el siguiente enlace:\n${url}\n\nSi no creaste esta cuenta, puedes ignorar este mensaje.\n\nSaludos,\nEquipo MedRound`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Verifica tu email</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hola <strong>${user.name}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Gracias por registrarte en MedRound. Por favor verifica tu email haciendo clic en el botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Verificar Email</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 12px; background-color: #f3f4f6; padding: 10px; border-radius: 4px;">${url}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
          <p style="font-size: 12px; color: #9ca3af;">Equipo MedRound</p>
        </div>
      `;

      // Enviar email con sistema de reintentos
      const result = await sendEmailWithRetry(user.email, subject, text, html);

      if (!result.success)
      {
        // 🚨 OPCIÓN 3: El email falló después de todos los reintentos
        // Mostrar mensaje al usuario pero NO bloquear el registro
        console.error(`🚫 [Auth] CRÍTICO: No se pudo enviar email de verificación para ${user.email}`);
        console.error(`   Error: ${result.error}`);
        console.error(`   Intentos realizados: ${result.attempts}`);
        console.log(`💡 [Auth] El usuario ${user.email} puede reenviar el email desde su perfil o la página de login`);

        // NOTA: No lanzamos error para que el registro se complete
        // Better Auth seguirá adelante y el usuario verá un mensaje explicando
        // que puede reenviar el email desde su cuenta

        // Opcional: Guardar en base de datos para seguimiento administrativo
        // await saveFailedVerificationEmail(user.id, user.email, result.error);

        return;
      }

      // Éxito: Email enviado correctamente
      console.log(`✅ [Auth] Email de verificación enviado exitosamente a: ${user.email}`);
      console.log(`   Intentos necesarios: ${result.attempts}`);
    },

    /**
     * Callback ejecutado después de que el usuario verifica su email exitosamente
     * 
     * @param user - Datos del usuario verificado
     * @param request - Request object de Next.js
     */
    afterEmailVerification: async (user, request) =>
    {
      console.log(`✅ [Auth] Email verificado exitosamente: ${user.email}`);

      // Actualizar el campo isEmailVerified en medicosProfile
      try
      {
        await prisma.medicosProfile.updateMany({
          where: { userId: user.id },
          data: { isEmailVerified: true },
        });
        console.log(`✅ [Auth] Perfil de médico actualizado (isEmailVerified: true) para: ${user.email}`);
      } catch (error)
      {
        console.error(`❌ [Auth] Error actualizando medicosProfile para ${user.email}:`, error);
        // No lanzamos error para no interrumpir el flujo de verificación
      }
    },
  },

  /**
   * Configuración de cuentas sociales (OAuth)
   * - Account linking deshabilitado por seguridad
   */
  account: {
    accountLinking: {
      enabled: false,
    },
  },

  /**
   * Configuración de sesiones
   * - Duración: 7 días
   * - Actualización: cada 1 día
   * - Cache de cookies: 5 minutos
   */
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días en segundos
    updateAge: 60 * 60 * 24, // 1 día en segundos
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutos en segundos
    },
  },

  /**
   * Proveedores de autenticación social
   * Deshabilitados por ahora, se pueden agregar después
   * Ejemplos: Google, GitHub, etc.
   */
  socialProviders: {
    // Ejemplo: Google OAuth
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
  },
});

/**
 * Tipo exportado para el cliente de autenticación
 * Útil para tipado en componentes cliente
 */
export type Auth = typeof auth;
