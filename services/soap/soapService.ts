import { PrismaClient, Prisma } from "@prisma/client";
import {
  ErrorCodes,
  type AppError,
} from "@/lib/errors";
import type {
  CreateSoapNoteData,
  UpdateSoapNoteData,
  ListSoapNotesFilters,
  CreateSoapNoteResult,
  GetSoapNoteResult,
  ListSoapNotesResult,
  UpdateSoapNoteResult,
  SoapNoteOperationResult,
  SoapNoteWithRelations,
} from "./types";

import { soapNoteSchema } from "@/lib/schemas/soapSchema";
import { parseVitalSignsToJson, parseJsonToVitalSigns } from "./soapValidation";

/**
 * Schema de validación Zod para creación de nota SOAP (reutilizado de lib/schemas)
 */
const createSoapNoteSchema = soapNoteSchema;

/**
 * Schema de validación Zod para actualización de nota SOAP
 */
const updateSoapNoteSchema = soapNoteSchema.partial();

/**
 * Servicio para gestión de notas SOAP
 *
 * Proporciona operaciones CRUD para notas de evolución médica:
 * - Crear nota SOAP con validación de datos
 * - Obtener nota por ID con o sin relaciones
 * - Listar notas con filtros y paginación
 * - Actualizar datos de la nota
 * - Eliminar nota
 * - Obtener notas de un paciente específico
 */
export class SoapService
{
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient)
  {
    this.prisma = prisma;
  }

  /**
   * Crea una nueva nota SOAP
   *
   * @param data Datos de la nota SOAP a crear
   * @param authorId ID del médico que crea la nota
   * @returns Resultado de la operación con la nota creada o error
   */
  async create(data: CreateSoapNoteData, authorId: string): Promise<CreateSoapNoteResult>
  {
    try
    {
      const validationResult = createSoapNoteSchema.safeParse(data);
      if (!validationResult.success)
      {
        const firstIssue = validationResult.error.issues[0];
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: firstIssue?.message || "Datos inválidos",
          statusCode: 400,
          details: validationResult.error.issues.map((e) => `${String(e.path[0])}: ${e.message}`).join(", "),
        };
        return { success: false, error };
      }

      const patient = await this.prisma.patient.findUnique({
        where: { id: data.patientId },
      });

      if (!patient)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Paciente no encontrado",
          statusCode: 404,
        };
        return { success: false, error };
      }

      const vitalSignsJson = parseVitalSignsToJson(data.vitalSigns);

      const note = await this.prisma.soapNote.create({
        data: {
          patientId: data.patientId,
          chiefComplaint: data.chiefComplaint,
          historyOfPresentIllness: data.historyOfPresentIllness,
          vitalSigns: vitalSignsJson as Prisma.JsonObject,
          physicalExam: data.physicalExam,
          laboratoryResults: data.laboratoryResults ?? null,
          imagingResults: data.imagingResults ?? null,
          assessment: data.assessment,
          plan: data.plan,
          medications: data.medications ?? null,
          pendingStudies: data.pendingStudies ?? null,
          authorId: authorId,
          hospital: patient.hospital,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bedNumber: true,
              roomNumber: true,
            },
          },
        },
      });

      const noteWithVitalSigns: SoapNoteWithRelations = {
        ...note,
        vitalSigns: parseJsonToVitalSigns(note.vitalSigns as string | null),
      };

      return {
        success: true,
        note: noteWithVitalSigns,
      };
    } catch (error)
    {
      if (error instanceof Error && (error as Error & { code?: string }).code === "P2002")
      {
        const appError: AppError = {
          code: ErrorCodes.DUPLICATE_ERROR,
          message: "Ya existe una nota con estos datos",
          statusCode: 409,
        };
        return { success: false, error: appError };
      }

      console.error("Error en SoapService.create:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al crear la nota SOAP",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Obtiene una nota SOAP por su ID
   *
   * @param id ID de la nota
   * @returns Resultado con la nota o error
   */
  async getById(id: string): Promise<GetSoapNoteResult>
  {
    try
    {
      const note = await this.prisma.soapNote.findUnique({
        where: { id },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bedNumber: true,
              roomNumber: true,
            },
          },
        },
      });

      if (!note)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Nota SOAP no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      const noteWithVitalSigns: SoapNoteWithRelations = {
        ...note,
        vitalSigns: parseJsonToVitalSigns(note.vitalSigns as string | null),
      };

      return {
        success: true,
        note: noteWithVitalSigns,
      };
    } catch (error)
    {
      console.error("Error en SoapService.getById:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al obtener la nota SOAP",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Lista notas SOAP con filtros y paginación
   *
   * @param filters Filtros para la búsqueda
   * @returns Resultado con la lista de notas o error
   */
  async list(filters: ListSoapNotesFilters): Promise<ListSoapNotesResult>
  {
    try
    {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {
        hospital: filters.hospital,
      };

      if (filters.patientId)
      {
        where.patientId = filters.patientId;
      }

      if (filters.authorId)
      {
        where.authorId = filters.authorId;
      }

      if (filters.startDate || filters.endDate)
      {
        where.date = {};
        if (filters.startDate)
        {
          (where.date as Record<string, Date>).gte = filters.startDate;
        }
        if (filters.endDate)
        {
          (where.date as Record<string, Date>).lte = filters.endDate;
        }
      }

      const [notes, total] = await Promise.all([
        this.prisma.soapNote.findMany({
          where,
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                bedNumber: true,
                roomNumber: true,
              },
            },
          },
          orderBy: { date: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.soapNote.count({ where }),
      ]);

      const notesWithVitalSigns: SoapNoteWithRelations[] = notes.map((note) => ({
        ...note,
        vitalSigns: parseJsonToVitalSigns(note.vitalSigns as string | null),
      }));

      return {
        success: true,
        notes: notesWithVitalSigns,
        total,
        page,
        limit,
      };
    } catch (error)
    {
      console.error("Error en SoapService.list:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al listar las notas SOAP",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Actualiza una nota SOAP existente
   *
   * @param id ID de la nota a actualizar
   * @param data Datos a actualizar
   * @returns Resultado con la nota actualizada o error
   */
  async update(id: string, data: UpdateSoapNoteData): Promise<UpdateSoapNoteResult>
  {
    try
    {
      const validationResult = updateSoapNoteSchema.safeParse(data);
      if (!validationResult.success)
      {
        const firstIssue = validationResult.error.issues[0];
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: firstIssue?.message || "Datos inválidos",
          statusCode: 400,
          details: validationResult.error.issues.map((e) => `${String(e.path[0])}: ${e.message}`).join(", "),
        };
        return { success: false, error };
      }

      const existingNote = await this.prisma.soapNote.findUnique({
        where: { id },
      });

      if (!existingNote)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Nota SOAP no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      const vitalSignsJson = parseVitalSignsToJson(data.vitalSigns);

      const updateData: Record<string, unknown> = { ...data };
      if (vitalSignsJson)
      {
        updateData.vitalSigns = vitalSignsJson;
      }

      const note = await this.prisma.soapNote.update({
        where: { id },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bedNumber: true,
              roomNumber: true,
            },
          },
        },
      });

      const noteWithVitalSigns: SoapNoteWithRelations = {
        ...note,
        vitalSigns: parseJsonToVitalSigns(note.vitalSigns as string | null),
      };

      return {
        success: true,
        note: noteWithVitalSigns,
      };
    } catch (error)
    {
      console.error("Error en SoapService.update:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al actualizar la nota SOAP",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Elimina una nota SOAP (hard delete)
   *
   * @param id ID de la nota a eliminar
   * @returns Resultado de la operación o error
   */
  async delete(id: string): Promise<SoapNoteOperationResult>
  {
    try
    {
      const existingNote = await this.prisma.soapNote.findUnique({
        where: { id },
      });

      if (!existingNote)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Nota SOAP no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      await this.prisma.soapNote.delete({
        where: { id },
      });

      return { success: true };
    } catch (error)
    {
      console.error("Error en SoapService.delete:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al eliminar la nota SOAP",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Obtiene todas las notas de un paciente específico
   *
   * @param patientId ID del paciente
   * @param hospital Hospital para filtrar
   * @returns Resultado con la lista de notas o error
   */
  async getByPatient(patientId: string, hospital: string): Promise<ListSoapNotesResult>
  {
    try
    {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Paciente no encontrado",
          statusCode: 404,
        };
        return { success: false, error };
      }

      const notes = await this.prisma.soapNote.findMany({
        where: {
          patientId,
          hospital,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bedNumber: true,
              roomNumber: true,
            },
          },
        },
        orderBy: { date: "desc" },
      });

      const notesWithVitalSigns: SoapNoteWithRelations[] = notes.map((note) => ({
        ...note,
        vitalSigns: parseJsonToVitalSigns(note.vitalSigns as string | null),
      }));

      return {
        success: true,
        notes: notesWithVitalSigns,
        total: notes.length,
        page: 1,
        limit: notes.length,
      };
    } catch (error)
    {
      console.error("Error en SoapService.getByPatient:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al obtener las notas del paciente",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }
}
