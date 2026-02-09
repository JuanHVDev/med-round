import { Resend } from "resend";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend | null
{
  if (!resendInstance)
  {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey)
    {
      return null;
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export function hasResendConfig(): boolean
{
  return !!process.env.RESEND_API_KEY;
}

const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || "noreply@medround.app";
const DEFAULT_FROM_NAME = process.env.EMAIL_FROM_NAME || "MedRound";
const EMAIL_TIMEOUT_MS = 10000;

interface SendEmailParams
{
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SendEmailResult
{
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<SendEmailResult>
{
  if (!process.env.RESEND_API_KEY)
  {
    console.warn("RESEND_API_KEY no configurada, email no enviado");
    return { success: false, error: "Servicio de email no configurado" };
  }

  try
  {
    const from = `${DEFAULT_FROM_NAME} <${DEFAULT_FROM_EMAIL}>`;
    const client = getResendClient();

    if (!client)
    {
      return { success: false, error: "Servicio de email no disponible" };
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
    {
      setTimeout(() => reject(new Error("Timeout de email")), EMAIL_TIMEOUT_MS);
    });

    const { data, error } = await Promise.race([
      client.emails.send({ from, to: [to], subject, text, html: html || text }),
      timeoutPromise,
    ]);

    if (error)
    {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error)
  {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return { success: false, error: errorMessage };
  }
}
