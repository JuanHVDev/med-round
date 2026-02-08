/**
 * Validaciones para el servicio de Handover
 *
 * Funciones de validación que complementan el schema Zod
 * para el servicio de entrega de guardia.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import {
  createHandoverSchema,
  updateHandoverSchema,
  handoverFiltersSchema,
} from "@/lib/schemas/handoverSchema";
import type {
  CreateHandoverInput,
  UpdateHandoverInput,
  HandoverFilters,
} from "@/services/handover/types";

export { createHandoverSchema, updateHandoverSchema, handoverFiltersSchema };

export function validateCreateHandover(
  data: unknown
): { success: true; data: CreateHandoverInput } | { success: false; error: string } {
  const result = createHandoverSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: `${String(firstIssue?.path[0])}: ${firstIssue?.message}` };
}

export function validateUpdateHandover(
  data: unknown
): { success: true; data: UpdateHandoverInput } | { success: false; error: string } {
  const result = updateHandoverSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: `${String(firstIssue?.path[0])}: ${firstIssue?.message}` };
}

export function validateHandoverFilters(
  data: unknown
): { success: true; data: HandoverFilters } | { success: false; error: string } {
  const result = handoverFiltersSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: `${String(firstIssue?.path[0])}: ${firstIssue?.message}` };
}

export function parseDateTime(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}
