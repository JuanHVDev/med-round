import { z } from "zod";

/**
 * Schema de validación Zod para pacientes
 * Utilizado tanto en el PatientService (backend) como en el PatientForm (frontend)
 */
export const patientSchema = z.object({
  medicalRecordNumber: z.string().min(1, "Número de historia clínica requerido"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  dateOfBirth: z.string().refine((val) =>
  {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Fecha de nacimiento inválida" }),
  gender: z.enum(["M", "F", "O"], {
    message: "Género debe ser M (Masculino), F (Femenino) u O (Otro)",
  }),
  admissionDate: z.string().refine((val) =>
  {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Fecha de ingreso inválida" }),
  bedNumber: z.string().min(1, "Número de cama requerido"),
  roomNumber: z.string().optional().nullable(),
  service: z.string().min(1, "Servicio requerido"),
  diagnosis: z.string().min(1, "Diagnóstico requerido"),
  allergies: z.string().optional().nullable(),
  hospital: z.string().min(1, "Hospital requerido"),
  attendingDoctor: z.string().min(1, "Médico tratante requerido"),
  bloodType: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  insuranceProvider: z.string().optional().nullable(),
  insuranceNumber: z.string().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  height: z.number().positive().optional().nullable(),
  specialNotes: z.string().optional().nullable(),
  dietType: z.string().optional().nullable(),
  isolationPrecautions: z.string().optional().nullable(),
});

export type PatientSchemaType = z.infer<typeof patientSchema>;
