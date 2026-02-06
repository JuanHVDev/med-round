/**
 * Schema de validación Zod para notas SOAP
 *
 * Define las reglas de validación para crear y editar notas SOAP
 */

import { z } from "zod";

export const vitalSignsSchema = z.object({
  bloodPressure: z.string().optional(),
  heartRate: z.number().positive().optional(),
  temperature: z.number().positive().optional(),
  respiratoryRate: z.number().positive().optional(),
  oxygenSaturation: z.number().min(0).max(100).optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const soapNoteSchema = z.object({
  patientId: z.string().uuid("ID de paciente inválido"),
  chiefComplaint: z
    .string()
    .min(1, "Motivo de consulta requerido")
    .max(500, "Máximo 500 caracteres"),
  historyOfPresentIllness: z
    .string()
    .min(1, "Historia de la enfermedad actual requerida")
    .max(2000, "Máximo 2000 caracteres"),
  vitalSigns: vitalSignsSchema.optional(),
  physicalExam: z
    .string()
    .min(1, "Exploración física requerida")
    .max(2000, "Máximo 2000 caracteres"),
  laboratoryResults: z.string().optional().nullable(),
  imagingResults: z.string().optional().nullable(),
  assessment: z
    .string()
    .min(1, "Evaluación/Impresión diagnóstica requerida")
    .max(1000, "Máximo 1000 caracteres"),
  plan: z.string().min(1, "Plan terapéutico requerido").max(1000, "Máximo 1000 caracteres"),
  medications: z.string().optional().nullable(),
  pendingStudies: z.string().optional().nullable(),
});

export type SoapNoteSchemaType = z.infer<typeof soapNoteSchema>;
export type VitalSignsSchemaType = z.infer<typeof vitalSignsSchema>;
