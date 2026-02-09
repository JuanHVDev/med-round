import { getResendClient, sendEmail as sendEmailLib } from "@/lib/email";
import type { EmailOptions, EmailResult } from "../types/serviceTypes";
import { ErrorCodes } from "@/lib/errors";

export interface IEmailService {
  sendWithRetry(options: EmailOptions): Promise<EmailResult>;
  sendVerificationEmail(email: string, token: string): Promise<EmailResult>;
}

export class EmailService implements IEmailService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;
  private readonly TIMEOUT_MS = 10000;

  async sendWithRetry(options: EmailOptions): Promise<EmailResult> {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      console.log(
        `📧 [Email Retry] Intento ${attempt}/${this.MAX_RETRIES} para: ${options.to}`
      );

      try {
        const result = await this.sendWithTimeout(options);

        if (result.success) {
          console.log(
            `✅ [Email Retry] Éxito en intento ${attempt} para: ${options.to}`
          );
          return result;
        }

        lastError = result.success ? undefined : "Error desconocido";
        console.warn(`⚠️ [Email Retry] Intento ${attempt} falló`);

        if (attempt < this.MAX_RETRIES) {
          console.log(
            `⏱️ [Email Retry] Esperando ${this.RETRY_DELAY_MS}ms antes del siguiente intento...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS)
          );
        }
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : "Error inesperado";
        console.error(
          `❌ [Email Retry] Error inesperado en intento ${attempt}:`
        );

        if (attempt < this.MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.RETRY_DELAY_MS)
          );
        }
      }
    }

    console.error("🚫 [Email Retry] Todos los intentos fallaron");
    return {
      success: false,
      error: {
        code: ErrorCodes.EMAIL_SEND_ERROR,
        message: "No se pudo enviar el email después de múltiples intentos",
        details: lastError ? `Error: ${lastError}` : undefined,
      },
    };
  }

  private async sendWithTimeout(
    options: EmailOptions
  ): Promise<EmailResult> {
    const emailPromise = this.sendEmail(options);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout de ${this.TIMEOUT_MS}ms excedido`));
      }, this.TIMEOUT_MS);
    });

    try {
      const result = await Promise.race([emailPromise, timeoutPromise]);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Timeout desconocido";
      return {
        success: false,
        error: {
          code: ErrorCodes.EMAIL_SEND_ERROR,
          message,
        },
      };
    }
  }

  private async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const result = await sendEmailLib({
      to: options.to,
      subject: options.subject,
      text: options.text || "",
      html: options.html,
    });

    if (!result.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.EMAIL_SEND_ERROR,
          message: result.error || "Error al enviar email",
        },
      };
    }

    return {
      success: true,
      messageId: typeof result.data === "object" && result.data !== null 
        ? (result.data as { id?: string }).id ?? "unknown" 
        : "unknown",
    };
  }

  async sendVerificationEmail(
    email: string,
    token: string
  ): Promise<EmailResult> {
    const verificationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verifica tu cuenta de MedRound</h2>
        <p>Hola,</p>
        <p>Gracias por registrarte en MedRound. Para completar tu registro, por favor verifica tu email haciendo clic en el botón:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verificar mi cuenta
        </a>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Si no solicitaste este registro, puedes ignorar este email.
        </p>
      </div>
    `;

    const text = `
Verifica tu cuenta de MedRound

Hola,

Gracias por registrarte en MedRound. Para completar tu registro, visita:
${verificationUrl}

Si no solicitaste este registro, ignora este email.
    `;

    return this.sendWithRetry({
      to: email,
      subject: "Verifica tu cuenta de MedRound",
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
