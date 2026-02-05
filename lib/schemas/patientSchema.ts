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
  gender: z.enum(["M", "F", "O"]),
  bedNumber: z.string().min(1, "Número de cama requerido"),
  roomNumber: z.string().optional(),
  service: z.string().min(1, "Servicio requerido"),
  diagnosis: z.string().min(1, "Diagnóstico requerido").max(500, "Máximo 500 caracteres"),
  allergies: z.string().optional(),
  attendingDoctor: z.string().min(1, "Médico tratante requerido"),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  specialNotes: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  dietType: z.string().optional(),
  isolationPrecautions: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
