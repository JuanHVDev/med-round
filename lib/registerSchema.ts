import { z } from "zod"

/**
 * Schema de validación Zod para el formulario de registro de médicos.
 *
 * Este schema define todas las reglas de validación para el registro de nuevos usuarios
 * en MedRound, incluyendo validaciones condicionales según el tipo de usuario
 * (profesional médico vs estudiante).
 *
 * El schema es compartido entre:
 * - Frontend: Validación en tiempo real con React Hook Form
 * - Backend: Validación de datos en la API de registro
 *
 * Validaciones implementadas:
 * - Campos requeridos básicos (nombre, email, contraseña)
 * - Validación de email válido
 * - Contraseña mínima de 8 caracteres
 * - Confirmación de contraseña debe coincidir
 * - Validación condicional según tipo de usuario:
 *   - Profesionales: Requiere ID profesional
 *   - Estudiantes: Requiere tipo (MPSS/MIP) y matrícula universitaria
 * - Hospital "Otro" requiere especificación manual
 *
 * @see {@link FormData} Tipo inferido del schema para TypeScript
 * @see {@link https://zod.dev} Documentación de Zod
 */
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

/**
 * Tipo TypeScript inferido del schema de registro.
 *
 * Representa la estructura completa de datos validados del formulario de registro.
 * Se utiliza para tipar formularios React, APIs y servicios de registro.
 *
 * @example
 * // Uso en componente React con React Hook Form
 * const form = useForm<FormData>({
 *   resolver: zodResolver(formSchema),
 *   defaultValues: { fullName: "", email: "", ... }
 * })
 *
 * @example
 * // Uso en API route
 * async function register(data: FormData) {
 *   const validated = formSchema.parse(data)
 *   // ... lógica de registro
 * }
 *
 * @see {@link formSchema} Schema Zod del cual se infiere este tipo
 */
export type FormData = z.infer<typeof formSchema>