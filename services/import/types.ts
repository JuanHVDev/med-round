/**
 * Tipos para el módulo de importación de pacientes
 * 
 * Define las estructuras de datos para la extracción de pacientes
 * desde archivos (CSV, PDF, imágenes) mediante procesamiento con IA
 */

import { z } from "zod";

/**
 * Tipos de archivo soportados para importación
 */
export type FileType = "csv" | "pdf" | "image";

/**
 * Schema Zod para validar paciente extraído
 * Todos los campos son opcionales ya que la IA puede no encontrarlos todos
 */
export const extractedPatientSchema = z.object({
  medicalRecordNumber: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
  bedNumber: z.string().optional(),
  roomNumber: z.string().optional(),
  service: z.string().optional(),
  diagnosis: z.string().optional(),
  allergies: z.string().optional(),
  attendingDoctor: z.string().optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  specialNotes: z.string().optional(),
  dietType: z.string().optional(),
  isolationPrecautions: z.string().optional(),
});

/**
 * Tipo inferido del schema de paciente extraído
 */
export type ExtractedPatient = z.infer<typeof extractedPatientSchema>;

/**
 * Resultado de la extracción de pacientes desde un archivo
 */
export interface ExtractionResult {
  /** Indica si la extracción fue exitosa */
  success: boolean;
  /** Lista de pacientes extraídos */
  patients: ExtractedPatient[];
  /** Lista de errores si los hay */
  errors?: string[];
  /** Texto crudo extraído (para debugging) */
  rawText?: string;
}

/**
 * Opciones para el procesamiento de archivos
 */
export interface FileProcessingOptions {
  /** Hospital al que pertenecen los pacientes */
  hospital: string;
  /** ID del usuario que realiza la importación */
  uploadedBy: string;
}

/**
 * Respuesta de la API de importación
 */
export interface ImportApiResponse {
  success: boolean;
  patients: ExtractedPatient[];
  count: number;
  errors?: string[];
}
