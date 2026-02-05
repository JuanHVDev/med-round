/**
 * Schema de validación Zod para pacientes
 *
 * Define las reglas de validación para crear y editar pacientes
 */

import { z } from "zod";

export const patientSchema = z.object({
  medicalRecordNumber: z.string().min(1, "Número de historia clínica requerido"),
  firstName: z.string().min(1, "Nombre requerido").max(50, "Máximo 50 caracteres"),
  lastName: z.string().min(1, "Apellido requerido").max(50, "Máximo 50 caracteres"),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Fecha de nacimiento inválida" }),
  gender: z.enum(["M", "F", "O"], {
    message: "Género debe ser M (Masculino), F (Femenino) u O (Otro)",
  }),
  admissionDate: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Fecha de admisión inválida" }).optional(),
  bedNumber: z.string().min(1, "Número de cama requerido"),
  roomNumber: z.string().optional().nullable(),
  service: z.string().min(1, "Servicio requerido"),
  diagnosis: z.string().min(1, "Diagnóstico requerido").max(500, "Máximo 500 caracteres"),
  allergies: z.string().optional().nullable(),
  hospital: z.string().min(1, "Hospital requerido"),
  attendingDoctor: z.string().min(1, "Médico tratante requerido"),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  insuranceProvider: z.string().optional().nullable(),
  insuranceNumber: z.string().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  specialNotes: z.string().max(1000, "Máximo 1000 caracteres").optional().nullable(),
  dietType: z.string().optional().nullable(),
  isolationPrecautions: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type PatientSchemaType = z.infer<typeof patientSchema>;
export type PatientFormData = PatientSchemaType;
