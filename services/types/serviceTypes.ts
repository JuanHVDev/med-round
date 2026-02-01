import type { ErrorCode } from "@/lib/errors";

export interface ServiceError {
  code: ErrorCode;
  message: string;
  details?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  professionalId?: string;
  studentType?: "MPSS" | "MIP";
  universityMatricula?: string;
  hospital: string;
  otherHospital?: string;
  specialty: string;
  userType: "professional" | "student";
}

export interface RegistrationResult {
  success: boolean;
  userId?: string;
  error?: ServiceError;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export type EmailResult =
  | { success: true; messageId: string }
  | { success: false; error: ServiceError };

export interface RateLimitCheckResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
  error?: ServiceError;
}
