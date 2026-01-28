import { z } from "zod"

export const formSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingrese un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().min(8, "La confirmación debe tener al menos 8 caracteres"),
  professionalId: z.string().optional(),
  studentType: z.enum(["MPSS", "MIP"]).optional(),
  universityMatricula: z.string().optional(),
  hospital: z.string().min(2, "El hospital es requerido"),
  otherHospital: z.string().optional(),
  specialty: z.string().min(2, "La especialidad es requerida"),
  userType: z.enum(["professional", "student"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.userType === "professional") {
    return data.professionalId && data.professionalId.length > 0
  }
  if (data.userType === "student") {
    return data.studentType && data.universityMatricula && data.universityMatricula.length > 0
  }
  return true
}, {
  message: "Complete los campos requeridos según su tipo de usuario",
  path: ["userType"],
}).refine((data) => {
  if (data.hospital === "Otro") {
    return data.otherHospital && data.otherHospital.length > 0
  }
  return true
}, {
  message: "Especifique el nombre del hospital",
  path: ["otherHospital"],
})

export type FormData = z.infer<typeof formSchema>