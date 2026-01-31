import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // [!] CAMBIO: Requerir verificación
    autoSignIn: false, // [!] CAMBIO: No iniciar sesión automáticamente después de registro
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  emailVerification: {
    sendOnSignUp: true, // [!] NUEVO: Enviar email de verificación al registrarse
    autoSignInAfterVerification: true, // [!] NUEVO: Iniciar sesión automáticamente después de verificar
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // [!] NUEVO: Enviar email de verificación
      void sendEmail({
        to: user.email,
        subject: 'Verifica tu email - MedRound',
        text: `Hola ${user.name},\n\nPor favor verifica tu email haciendo clic en el siguiente enlace:\n${url}\n\nSi no creaste esta cuenta, puedes ignorar este mensaje.\n\nSaludos,\nEquipo MedRound`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Verifica tu email</h2>
            <p>Hola <strong>${user.name}</strong>,</p>
            <p>Gracias por registrarte en MedRound. Por favor verifica tu email haciendo clic en el botón:</p>
            <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verificar Email</a>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #6b7280;">${url}</p>
            <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
            <p style="font-size: 12px; color: #9ca3af;">Equipo MedRound</p>
          </div>
        `,
      });
    },
    afterEmailVerification: async (user, request) => {
      // [!] NUEVO: Callback después de verificación exitosa
      console.log(`✅ Email verificado exitosamente: ${user.email}`);
      
      // Actualizar también el campo isEmailVerified en medicosProfile
      try {
        await prisma.medicosProfile.updateMany({
          where: { userId: user.id },
          data: { isEmailVerified: true },
        });
      } catch (error) {
        console.error('Error updating medicosProfile:', error);
      }
    },
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  socialProviders: {
    // Add Google, GitHub later if needed
  },
});

// Export client type
export type Auth = typeof auth;
