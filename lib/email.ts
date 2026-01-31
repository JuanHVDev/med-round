import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'MedRound'} <${process.env.EMAIL_FROM || 'noreply@medround.app'}>`,
      to: [to],
      subject,
      text,
      html: html || text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
