/**
 * Schemas Zod para validación de Handover (Entrega de Guardia)
 *
 * Este archivo define los schemas Zod utilizados para validar los datos
 * de entrada en el servicio de entrega de guardia.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { z } from "zod";

export const createHandoverSchema = z.object({
  hospital: z.string().min(1, "El hospital es requerido"),
  service: z.string().min(1, "El servicio es requerido"),
  shiftType: z.enum(["MORNING", "AFTERNOON", "NIGHT"]),
  shiftDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Fecha de turno inválida" }
  ),
  startTime: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: "Hora de inicio inválida" }
  ),
  endTime: z.string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: "Hora de fin inválida" }
    ),
});

export const updateHandoverSchema = z.object({
  includedPatientIds: z.array(z.string()).optional(),
  includedTaskIds: z.array(z.string()).optional(),
  checklistItems: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().min(1, "La descripción es requerida"),
        isCompleted: z.boolean().default(false),
        completedBy: z.string().optional(),
        completedAt: z.date().optional(),
        order: z.number().int().min(0).default(0),
      })
    )
    .optional(),
  generalNotes: z.string().optional(),
});

export const handoverFiltersSchema = z.object({
  hospital: z.string().optional(),
  service: z.string().optional(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "FINALIZED"]).optional(),
  createdBy: z.string().optional(),
  shiftDate: z.string().optional(),
  shiftType: z.enum(["MORNING", "AFTERNOON", "NIGHT"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const finalizeHandoverSchema = z.object({
  generatePdf: z.boolean().default(false),
});

export type CreateHandoverData = z.infer<typeof createHandoverSchema>;
export type UpdateHandoverData = z.infer<typeof updateHandoverSchema>;
export type HandoverFiltersData = z.infer<typeof handoverFiltersSchema>;
export type FinalizeHandoverData = z.infer<typeof finalizeHandoverSchema>;
