/**
 * Validaciones para el servicio de tareas
 *
 * Funciones de validación que complementan el schema Zod
 */

import { createTaskSchema, updateTaskSchema, taskFiltersSchema } from "@/lib/schemas/taskSchema";
import type { CreateTaskInput, UpdateTaskInput, TaskFilters } from "@/lib/schemas/taskSchema";

export { createTaskSchema, updateTaskSchema, taskFiltersSchema };

export function validateCreateTask(
  data: unknown
): { success: true; data: CreateTaskInput } | { success: false; error: string } {
  const result = createTaskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: `${String(firstIssue?.path[0])}: ${firstIssue?.message}` };
}

export function validateUpdateTask(
  data: unknown
): { success: true; data: UpdateTaskInput } | { success: false; error: string } {
  const result = updateTaskSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: `${String(firstIssue?.path[0])}: ${firstIssue?.message}` };
}

export function validateTaskFilters(
  data: unknown
): { success: true; data: TaskFilters } | { success: false; error: string } {
  const result = taskFiltersSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: `${String(firstIssue?.path[0])}: ${firstIssue?.message}` };
}

export function parseDueDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}
