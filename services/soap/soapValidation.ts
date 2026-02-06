/**
 * Validaciones adicionales para notas SOAP
 *
 * Funciones de validación que complementan el schema Zod
 */

import { z } from "zod";
import { vitalSignsSchema, soapNoteSchema } from "@/lib/schemas/soapSchema";
import type { VitalSigns } from "@/services/soap/types";

export { vitalSignsSchema, soapNoteSchema };

export function validateVitalSigns(data: unknown): { success: true; data: z.infer<typeof vitalSignsSchema> } | { success: false; error: z.ZodError } {
  const result = vitalSignsSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function validateSoapNote(data: unknown): { success: true; data: z.infer<typeof soapNoteSchema> } | { success: false; error: z.ZodError } {
  const result = soapNoteSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function parseVitalSignsToJson(vitalSigns: VitalSigns | null | undefined): Record<string, unknown> | null {
  if (!vitalSigns || Object.keys(vitalSigns).length === 0) {
    return null;
  }
  return vitalSigns as Record<string, unknown>;
}

export function parseJsonToVitalSigns(json: string | null | undefined): Record<string, unknown> | null {
  if (!json) {
    return null;
  }
  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isValidBloodPressure(value: string): boolean {
  const regex = /^\d{2,3}\/\d{2,3}$/;
  return regex.test(value);
}

export function formatBloodPressure(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length < 4) {
    return cleaned;
  }
  if (cleaned.length === 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return `${cleaned.slice(0, 3)}/${cleaned.slice(3, 5)}`;
}
