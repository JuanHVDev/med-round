/**
 * Tipos TypeScript para el servicio de Handover (Entrega de Guardia)
 *
 * Este archivo define todos los tipos utilizados en el servicio de entrega
 * de guardia, incluyendo inputs, outputs y tipos internos.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import type {
  HandoverStatus,
  HandoverShiftType,
  TaskPriority,
} from "@prisma/client";

/**
 * Datos de entrada para crear un nuevo handover
 */
export interface CreateHandoverInput {
  hospital: string;
  service: string;
  shiftType: HandoverShiftType;
  shiftDate: string;
  startTime: string;
  endTime?: string;
}

/**
 * Datos de entrada para actualizar un handover
 */
export interface UpdateHandoverInput {
  includedPatientIds?: string[];
  includedTaskIds?: string[];
  checklistItems?: ChecklistItem[];
  generalNotes?: string;
}

/**
 * Item del checklist de entrega de guardia
 */
export interface ChecklistItem {
  id: string;
  description: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: Date;
  order: number;
}

/**
 * Información de paciente crítico detectada automáticamente
 */
export interface CriticalPatientInfo {
  patientId: string;
  bedNumber: string;
  patientName: string;
  reason: string;
  lastSoapDate?: Date;
  pendingTasksCount: number;
  urgentTasksCount: number;
  highOverdueTasksCount?: number;
}

/**
 * Datos de constantes vitales para incluir en el resumen
 */
export interface VitalSignsSummary {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

/**
 * Información de nota SOAP para el resumen
 */
export interface SoapNoteSummary {
  id: string;
  date: Date;
  chiefComplaint: string;
  assessment: string;
  plan: string;
  vitalSigns?: VitalSignsSummary;
}

/**
 * Paciente con información relevante para handover
 */
export interface PatientHandoverInfo {
  id: string;
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  bedNumber: string;
  roomNumber?: string;
  diagnosis: string;
  allergies?: string;
  bloodType?: string;
  specialNotes?: string;
  admissionDate: Date;
  latestSoap?: SoapNoteSummary;
}

/**
 * Tarea con información para handover
 */
export interface TaskHandoverInfo {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: string;
  dueDate?: Date;
  patientId?: string;
  assignedToName?: string;
}

/**
 * Resultado de operación exitosa
 */
export interface HandoverOperationResult {
  success: true;
}

/**
 * Resultado de operación con error
 */
export interface HandoverErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: unknown;
  };
}

/**
 * Resultado de creación de handover
 */
export interface CreateHandoverResult extends HandoverOperationResult {
  handover?: never;
}

export interface CreateHandoverSuccess extends HandoverOperationResult {
  handover: HandoverWithRelations;
}

export type CreateHandoverReturn = CreateHandoverSuccess | HandoverErrorResult;

/**
 * Resultado de obtención de handover
 */
export interface GetHandoverResult {
  success: boolean;
  handover?: HandoverWithRelations;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Resultado de listado de handovers
 */
export interface ListHandoverResult {
  success: boolean;
  handovers: HandoverWithRelations[];
  total: number;
  page: number;
  limit: number;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Resultado de actualización de handover
 */
export interface UpdateHandoverResult {
  success: boolean;
  handover?: HandoverWithRelations;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Resultado de finalización de handover
 */
export interface FinalizeHandoverResult {
  success: boolean;
  handover?: HandoverWithRelations;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Handover completo con todas las relaciones
 */
export interface HandoverWithRelations {
  id: string;
  hospital: string;
  service: string;
  shiftType: HandoverShiftType;
  shiftDate: Date;
  startTime: Date;
  endTime?: Date;
  createdBy: string;
  creatorName?: string;
  status: HandoverStatus;
  includedPatientIds: string[];
  includedTaskIds: string[];
  checklistItems: ChecklistItem[];
  generalNotes?: string;
  generatedSummary?: string;
  criticalPatients?: CriticalPatientInfo[];
  finalizedAt?: Date;
  pdfUrl?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para generación de PDF
 */
export interface PdfHandoverData {
  handover: HandoverWithRelations;
  patients: PatientHandoverInfo[];
  tasks: TaskHandoverInfo[];
  criticalPatients: CriticalPatientInfo[];
  generatedAt: Date;
}

/**
 * Filtros para listado de handovers
 */
export interface HandoverFilters {
  hospital?: string;
  service?: string;
  status?: HandoverStatus;
  createdBy?: string;
  shiftDate?: string;
  shiftType?: HandoverShiftType;
  page?: number;
  limit?: number;
}

/**
 * Resumen generado para handover
 */
export interface GeneratedSummary {
  markdown: string;
  patientCount: number;
  taskCount: number;
  criticalCount: number;
  generatedAt: Date;
}
