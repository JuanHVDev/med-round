import { z } from "zod";

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const taskStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

export const taskTypeSchema = z.enum([
  "LABORATORY",
  "IMAGING",
  "CONSULT",
  "PROCEDURE",
  "MEDICATION",
  "OTHER",
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "Título muy largo"),
  description: z.string().max(1000, "Descripción muy larga").optional(),
  priority: taskPrioritySchema.default("MEDIUM"),
  type: taskTypeSchema.default("OTHER"),
  patientId: z.string().uuid("ID de paciente inválido").optional(),
  assignedTo: z.string().uuid("ID de asignado inválido"),
  dueDate: z.string().datetime("Fecha inválida").optional(),
  hospital: z.string().min(1, "El hospital es requerido"),
  service: z.string().optional(),
  shift: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "Título muy largo").optional(),
  description: z.string().max(1000, "Descripción muy larga").optional().nullable(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  type: taskTypeSchema.optional(),
  patientId: z.string().uuid("ID de paciente inválido").optional().nullable(),
  assignedTo: z.string().uuid("ID de asignado inválido").optional(),
  dueDate: z.string().datetime("Fecha inválida").optional().nullable(),
  hospital: z.string().optional(),
  service: z.string().optional(),
  shift: z.string().optional(),
});

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  patientId: z.string().uuid("ID de paciente inválido").optional(),
  assignedTo: z.string().uuid("ID de asignado inválido").optional(),
  hospital: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
}).strict();

export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
