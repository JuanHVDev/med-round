/**
 * Tipos para el servicio de pacientes
 * 
 * Define las interfaces de datos para:
 * - Creación de paciente
 * - Actualización de paciente
 * - Filtros de búsqueda
 * - Respuestas del servicio
 */

/**
 * Datos requeridos para crear un paciente
 */
export interface CreatePatientData {
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO string, se convierte a Date
  gender: string;
  bedNumber: string;
  roomNumber?: string;
  service: string;
  diagnosis: string;
  allergies?: string;
  hospital: string;
  attendingDoctor: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  weight?: number;
  height?: number;
  specialNotes?: string;
  dietType?: string;
  isolationPrecautions?: string;
}

/**
 * Datos para actualizar un paciente
 * Todos los campos son opcionales
 */
export interface UpdatePatientData {
  medicalRecordNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bedNumber?: string;
  roomNumber?: string | null;
  service?: string;
  diagnosis?: string;
  allergies?: string | null;
  hospital?: string;
  attendingDoctor?: string;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  weight?: number | null;
  height?: number | null;
  specialNotes?: string | null;
  dietType?: string | null;
  isolationPrecautions?: string | null;
}

/**
 * Filtros para listar pacientes
 */
export interface ListPatientsFilters {
  hospital: string;
  isActive?: boolean;
  service?: string;
  bedNumber?: string;
  page?: number;
  limit?: number;
}

/**
 * Paciente con relaciones incluidas
 */
export interface PatientWithRelations {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  admissionDate: Date;
  dischargedAt?: Date | null;
  bedNumber: string;
  roomNumber?: string | null;
  service: string;
  diagnosis: string;
  allergies?: string | null;
  isActive: boolean;
  hospital: string;
  attendingDoctor: string;
  bloodType?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  weight?: number | null;
  height?: number | null;
  specialNotes?: string | null;
  dietType?: string | null;
  isolationPrecautions?: string | null;
  createdAt: Date;
  updatedAt: Date;
  soapNotes?: Array<{
    id: string;
    date: Date;
    chiefComplaint: string;
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

/**
 * Respuesta exitosa de creación
 */
export interface CreatePatientSuccess {
  success: true;
  patient: PatientWithRelations;
}

/**
 * Respuesta exitosa de obtención
 */
export interface GetPatientSuccess {
  success: true;
  patient: PatientWithRelations;
}

/**
 * Respuesta exitosa de listado
 */
export interface ListPatientsSuccess {
  success: true;
  patients: PatientWithRelations[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Respuesta exitosa de actualización
 */
export interface UpdatePatientSuccess {
  success: true;
  patient: PatientWithRelations;
}

/**
 * Respuesta exitosa de operación simple
 */
export interface PatientOperationSuccess {
  success: true;
}

/**
 * Respuesta de error
 */
export interface PatientServiceError {
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
export type CreatePatientResult = CreatePatientSuccess | PatientServiceError;
export type GetPatientResult = GetPatientSuccess | PatientServiceError;
export type ListPatientsResult = ListPatientsSuccess | PatientServiceError;
export type UpdatePatientResult = UpdatePatientSuccess | PatientServiceError;
export type PatientOperationResult = PatientOperationSuccess | PatientServiceError;
