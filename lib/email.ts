import { Resend } from 'resend';

/**
 * Cliente de Resend para envío de emails
 * Se inicializa con la API key desde variables de entorno
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Parámetros para enviar un email
 * @property to - Dirección de email del destinatario
 * @property subject - Asunto del email
 * @property text - Contenido en texto plano
 * @property html - Contenido en HTML (opcional)
 */
interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Resultado del envío de email
 * @property success - Indica si el envío fue exitoso
 * @property data - Datos de la respuesta de Resend (si fue exitoso)
 * @property error - Mensaje de error (si falló)
 */
interface SendEmailResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Timeout para el envío de emails en milisegundos
 * Si el email tarda más de este tiempo, se cancela la operación
 */
const EMAIL_TIMEOUT_MS = 10000; // 10 segundos

/**
 * Email de remitente por defecto
 * Se usa si no está configurado en variables de entorno
 * NOTA: Debe ser un dominio verificado en Resend
 */
const DEFAULT_FROM_EMAIL = 'noreply@medround.app';

/**
 * Nombre del remitente por defecto
 */
const DEFAULT_FROM_NAME = 'MedRound';

/**
 * Envía un email usando Resend con manejo de errores y timeout
 * 
 * Esta función:
 * 1. Verifica que la API key de Resend esté configurada
 * 2. Aplica un timeout de 10 segundos al envío
 * 3. Maneja errores de la API de Resend
 * 4. Devuelve un resultado estructurado con éxito/error
 * 
 * @param params - Parámetros del email a enviar
 * @returns Promise<SendEmailResult> - Resultado del envío
 * 
 * @example
 * const result = await sendEmail({
 *   to: 'usuario@ejemplo.com',
 *   subject: 'Bienvenido',
 *   text: 'Hola, bienvenido a MedRound',
 *   html: '<p>Hola, bienvenido a <strong>MedRound</strong></p>'
 * });
 * 
 * if (result.success) {
 *   console.log('Email enviado:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<SendEmailResult> {
  // PASO 1: Verificar que la API key esté configurada
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ [Email] RESEND_API_KEY no está configurada');
    return { 
      success: false, 
      error: 'Servicio de email no configurado. Contacta al administrador.' 
    };
  }

  try {
    // PASO 2: Construir el remitente desde variables de entorno o valores por defecto
    const fromName = process.env.EMAIL_FROM_NAME || DEFAULT_FROM_NAME;
    const fromEmail = process.env.EMAIL_FROM || DEFAULT_FROM_EMAIL;
    const from = `${fromName} <${fromEmail}>`;

    // PASO 3: Enviar el email con Resend usando Promise.race para timeout
    console.log(`📧 [Email] Enviando a: ${to} | Asunto: ${subject}`);
    
    // Crear promesa de timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout: El email no pudo enviarse en ${EMAIL_TIMEOUT_MS / 1000} segundos`));
      }, EMAIL_TIMEOUT_MS);
    });
    
    // Competir entre el envío de email y el timeout
    const { data, error } = await Promise.race([
      resend.emails.send({
        from,
        to: [to],
        subject,
        text,
        html: html || text,
      }),
      timeoutPromise,
    ]);

    // PASO 6: Verificar si hubo error en la respuesta de Resend
    if (error) {
      console.error('❌ [Email] Error de Resend API:', error);
      return { 
        success: false, 
        error: `Error del servicio de email: ${error.message || 'Error desconocido'}` 
      };
    }

    // PASO 7: Email enviado exitosamente
    console.log(`✅ [Email] Enviado exitosamente a: ${to} | ID: ${data?.id}`);
    return { success: true, data };
    
  } catch (error) {
    // PASO 8: Manejar errores inesperados (timeout, network, etc.)
    let errorMessage = 'Error desconocido al enviar email';
    
    if (error instanceof Error) {
      // Detectar si fue un error de timeout
      if (error.name === 'AbortError') {
        errorMessage = `Timeout: El email no pudo enviarse en ${EMAIL_TIMEOUT_MS/1000} segundos`;
      } else {
        errorMessage = error.message;
      }
    }
    
    console.error('❌ [Email] Error inesperado:', errorMessage, error);
    return { success: false, error: errorMessage };
  }
}
