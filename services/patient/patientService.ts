import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  ErrorCodes,
  ValidationError,
  DuplicateError,
  DatabaseError,
  type AppError,
} from "@/lib/errors";
import type {
  CreatePatientData,
  UpdatePatientData,
  ListPatientsFilters,
  CreatePatientResult,
  GetPatientResult,
  ListPatientsResult,
  UpdatePatientResult,
  PatientOperationResult,
  PatientWithRelations,
} from "./types";

/**
 * Schema de validación Zod para creación de paciente
 */
const createPatientSchema = z.object({
  medicalRecordNumber: z.string().min(1, "Número de historia clínica requerido"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  dateOfBirth: z.string().datetime("Fecha de nacimiento inválida"),
  gender: z.enum(["M", "F", "O"]).refine((val) => ["M", "F", "O"].includes(val), {
    message: "Género debe ser M, F u O",
  }),
  bedNumber: z.string().min(1, "Número de cama requerido"),
  roomNumber: z.string().optional(),
  service: z.string().min(1, "Servicio requerido"),
  diagnosis: z.string().min(1, "Diagnóstico requerido"),
  allergies: z.string().optional(),
  hospital: z.string().min(1, "Hospital requerido"),
  attendingDoctor: z.string().min(1, "Médico tratante requerido"),
  bloodType: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  specialNotes: z.string().optional(),
  dietType: z.string().optional(),
  isolationPrecautions: z.string().optional(),
});

/**
 * Schema de validación Zod para actualización de paciente
 */
const updatePatientSchema = createPatientSchema.partial();

/**
 * Servicio para gestión de pacientes
 * 
 * Proporciona operaciones CRUD para pacientes hospitalizados:
 * - Crear paciente con validación de datos
 * - Obtener paciente por ID con o sin relaciones
 * - Listar pacientes con filtros y paginación
 * - Actualizar datos del paciente
 * - Dar de alta (soft delete)
 * - Reactivar paciente
 */
export class PatientService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Crea un nuevo paciente
   * 
   * @param data Datos del paciente a crear
   * @returns Resultado de la operación con el paciente creado o error
   */
  async create(data: CreatePatientData): Promise<CreatePatientResult> {
    try {
      // Validar datos con Zod
      const validationResult = createPatientSchema.safeParse(data);
      if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0];
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: firstIssue?.message || "Datos inválidos",
          statusCode: 400,
          details: validationResult.error.issues.map((e) => `${String(e.path[0])}: ${e.message}`).join(', '),
        };
        return { success: false, error };
      }

      // Convertir dateOfBirth de string a Date
      const patientData = {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
      };

      // Crear paciente
      const patient = await this.prisma.patient.create({
        data: patientData,
      });

      return {
        success: true,
        patient: patient as PatientWithRelations,
      };
    } catch (error) {
      // Manejar error de constraint única (medicalRecordNumber duplicado)
      if (error instanceof Error && (error as Error & { code?: string }).code === "P2002") {
        const appError: AppError = {
          code: ErrorCodes.DUPLICATE_ERROR,
          message: "El número de historia clínica ya está registrado",
          statusCode: 409,
          details: `El número '${data.medicalRecordNumber}' ya existe en el sistema`,
        };
        return { success: false, error: appError };
      }

      // Error genérico de base de datos
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al crear el paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Obtiene un paciente por su ID
   * 
   * @param id ID del paciente
   * @returns Resultado con el paciente o error si no existe
   */
  async getById(id: string): Promise<GetPatientResult> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
      });

      if (!patient) {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Paciente no encontrado",
          statusCode: 404,
          details: `No existe paciente con ID: ${id}`,
        };
        return { success: false, error };
      }

      return {
        success: true,
        patient: patient as PatientWithRelations,
      };
    } catch (error) {
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al buscar el paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Obtiene un paciente con sus notas SOAP y tareas
   * 
   * @param id ID del paciente
   * @returns Resultado con el paciente y relaciones o error
   */
  async getByIdWithRelations(id: string): Promise<GetPatientResult> {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        include: {
          soapNotes: {
            select: {
              id: true,
              date: true,
              chiefComplaint: true,
            },
            orderBy: { date: "desc" },
          },
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!patient) {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Paciente no encontrado",
          statusCode: 404,
          details: `No existe paciente con ID: ${id}`,
        };
        return { success: false, error };
      }

      return {
        success: true,
        patient: patient as PatientWithRelations,
      };
    } catch (error) {
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al buscar el paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Lista pacientes con filtros y paginación
   * 
   * @param filters Filtros de búsqueda
   * @returns Lista de pacientes y metadata de paginación
   */
  async list(filters: ListPatientsFilters): Promise<ListPatientsResult> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Construir where clause
      const where: Record<string, unknown> = {
        hospital: filters.hospital,
      };

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.service) {
        where.service = filters.service;
      }

      if (filters.bedNumber) {
        where.bedNumber = { contains: filters.bedNumber };
      }

      // Ejecutar query y count en paralelo
      const [patients, total] = await this.prisma.$transaction([
        this.prisma.patient.findMany({
          where,
          skip,
          take: limit,
          orderBy: { admissionDate: "desc" },
        }),
        this.prisma.patient.count({ where }),
      ]);

      return {
        success: true,
        patients: patients as PatientWithRelations[],
        total,
        page,
        limit,
      };
    } catch (error) {
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al listar pacientes",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Actualiza los datos de un paciente
   * 
   * @param id ID del paciente
   * @param data Datos a actualizar
   * @returns Resultado con el paciente actualizado o error
   */
  async update(id: string, data: UpdatePatientData): Promise<UpdatePatientResult> {
    try {
      // Validar datos
      const validationResult = updatePatientSchema.safeParse(data);
      if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0];
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: firstIssue?.message || "Datos inválidos",
          statusCode: 400,
          details: validationResult.error.issues.map((e) => `${String(e.path[0])}: ${e.message}`).join(', '),
        };
        return { success: false, error };
      }

      // Convertir dateOfBirth si está presente
      const updateData: Record<string, unknown> = { ...data };
      if (data.dateOfBirth) {
        updateData.dateOfBirth = new Date(data.dateOfBirth);
      }

      const patient = await this.prisma.patient.update({
        where: { id },
        data: updateData,
      });

      return {
        success: true,
        patient: patient as PatientWithRelations,
      };
    } catch (error) {
      // Manejar error de constraint única
      if (error instanceof Error && (error as Error & { code?: string }).code === "P2002") {
        const appError: AppError = {
          code: ErrorCodes.DUPLICATE_ERROR,
          message: "El número de historia clínica ya está registrado",
          statusCode: 409,
          details: "Ya existe un paciente con ese número de historia clínica",
        };
        return { success: false, error: appError };
      }

      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al actualizar el paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Da de alta a un paciente (soft delete)
   * Marca isActive como false y establece dischargedAt
   * 
   * @param id ID del paciente
   * @returns Resultado de la operación
   */
  async discharge(id: string): Promise<PatientOperationResult> {
    try {
      await this.prisma.patient.update({
        where: { id },
        data: {
          isActive: false,
          dischargedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al dar de alta al paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Reactiva un paciente dado de alta
   * Marca isActive como true y establece dischargedAt a null
   * 
   * @param id ID del paciente
   * @returns Resultado de la operación
   */
  async reactivate(id: string): Promise<PatientOperationResult> {
    try {
      await this.prisma.patient.update({
        where: { id },
        data: {
          isActive: true,
          dischargedAt: null,
        },
      });

      return { success: true };
    } catch (error) {
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al reactivar al paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Busca un paciente por número de cama y hospital
   * 
   * @param bedNumber Número de cama
   * @param hospital Nombre del hospital
   * @returns Resultado con el paciente o error
   */
  async findByBed(bedNumber: string, hospital: string): Promise<GetPatientResult> {
    try {
      const patient = await this.prisma.patient.findFirst({
        where: {
          bedNumber,
          hospital,
          isActive: true,
        },
      });

      if (!patient) {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Paciente no encontrado",
          statusCode: 404,
          details: `No hay paciente activo en la cama ${bedNumber} del ${hospital}`,
        };
        return { success: false, error };
      }

      return {
        success: true,
        patient: patient as PatientWithRelations,
      };
    } catch (error) {
      const appError: AppError = {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Error al buscar el paciente",
        statusCode: 500,
        details: error instanceof Error ? error.message : "Error desconocido",
      };
      return { success: false, error: appError };
    }
  }
}
