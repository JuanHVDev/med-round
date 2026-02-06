/**
 * Tipos para el servicio de notas SOAP
 *
 * Define las interfaces de datos para:
 * - Creación de nota SOAP
 * - Actualización de nota SOAP
 * - Signos vitales
 * - Filtros de búsqueda
 * - Respuestas del servicio
 */

/**
 * Signos vitales del paciente
 */
export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

/**
 * Datos requeridos para crear una nota SOAP
 */
export interface CreateSoapNoteData {
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitalSigns?: VitalSigns;
  physicalExam: string;
  laboratoryResults?: string;
  imagingResults?: string;
  assessment: string;
  plan: string;
  medications?: string;
  pendingStudies?: string;
}

/**
 * Datos para actualizar una nota SOAP
 * Todos los campos son opcionales
 */
export interface UpdateSoapNoteData {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  vitalSigns?: VitalSigns | null;
  physicalExam?: string;
  laboratoryResults?: string | null;
  imagingResults?: string | null;
  assessment?: string;
  plan?: string;
  medications?: string | null;
  pendingStudies?: string | null;
}

/**
 * Filtros para listar notas SOAP
 */
export interface ListSoapNotesFilters {
  patientId?: string;
  hospital: string;
  authorId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Nota SOAP con relaciones incluidas
 */
export interface SoapNoteWithRelations {
  id: string;
  patientId: string;
  date: Date;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitalSigns: VitalSigns | null;
  physicalExam: string;
  laboratoryResults: string | null;
  imagingResults: string | null;
  assessment: string;
  plan: string;
  medications: string | null;
  pendingStudies: string | null;
  authorId: string;
  hospital: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    bedNumber: string;
    roomNumber: string | null;
  };
  author?: {
    id: string;
    fullName: string;
  };
}

/**
 * Respuesta exitosa de creación
 */
export interface CreateSoapNoteSuccess {
  success: true;
  note: SoapNoteWithRelations;
}

/**
 * Respuesta exitosa de obtención
 */
export interface GetSoapNoteSuccess {
  success: true;
  note: SoapNoteWithRelations;
}

/**
 * Respuesta exitosa de listado
 */
export interface ListSoapNotesSuccess {
  success: true;
  notes: SoapNoteWithRelations[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Respuesta exitosa de actualización
 */
export interface UpdateSoapNoteSuccess {
  success: true;
  note: SoapNoteWithRelations;
}

/**
 * Respuesta exitosa de operación simple
 */
export interface SoapNoteOperationSuccess {
  success: true;
}

/**
 * Respuesta de error
 */
export interface SoapNoteServiceError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: string;
  };
}

/**
 * Tipos de resultado unificados
 */
export type CreateSoapNoteResult = CreateSoapNoteSuccess | SoapNoteServiceError;
export type GetSoapNoteResult = GetSoapNoteSuccess | SoapNoteServiceError;
export type ListSoapNotesResult = ListSoapNotesSuccess | SoapNoteServiceError;
export type UpdateSoapNoteResult = UpdateSoapNoteSuccess | SoapNoteServiceError;
export type SoapNoteOperationResult = SoapNoteOperationSuccess | SoapNoteServiceError;
