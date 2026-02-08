/**
 * Punto de entrada para todos los servicios de MedRound
 * 
 * Este archivo inicializa y configura todas las instancias de servicios
 * con sus dependencias inyectadas. Permite fácil testing mediante mocking
 * de estas instancias.
 * 
 * @example
 * // En tests, puedes mockear:
 * jest.mock('@/services', () => ({
 *   registrationService: mockRegistrationService
 * }))
 */

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { EmailService } from "./email/emailService";
import { RegistrationService } from "./auth/registrationService";
import { HandoverService } from "./handover/handoverService";

/**
 * Servicio de email con retry logic y timeout
 * Inyecta: cliente de Resend (via lib/email)
 */
export const emailService = new EmailService();

/**
 * Servicio de registro con transacciones atómicas
 * Inyecta:
 * - prisma: Cliente de base de datos para perfiles médicos
 * - auth: API de Better Auth para creación de usuarios
 * - emailService: Para envío de emails de verificación
 */
export const registrationService = new RegistrationService(
  prisma,
  {
    signUpEmail: auth.api.signUpEmail.bind(auth.api),
  },
  emailService
);

/**
 * Servicio de handover (Entrega de Guardia)
 * Maneja CRUD de handovers, detección de pacientes críticos
 * y generación de resúmenes
 */
export const handoverService = new HandoverService(prisma);
