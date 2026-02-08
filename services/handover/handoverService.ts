/**
 * Servicio de Handover (Entrega de Guardia)
 *
 * Este servicio proporciona operaciones CRUD completas para la gestión
 * de entregas de guardia, incluyendo:
 * - Crear nuevos handovers
 * - Obtener handovers existentes
 * - Listar handovers con filtros
 * - Actualizar handovers (agregar pacientes, tareas, notas)
 * - Finalizar handovers con generación automática de resumen
 * - Detectar pacientes críticos automáticamente
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { ErrorCodes, type AppError } from "@/lib/errors";
import type {
  CreateHandoverInput,
  UpdateHandoverInput,
  HandoverFilters,
  CreateHandoverReturn,
  GetHandoverResult,
  ListHandoverResult,
  UpdateHandoverResult,
  FinalizeHandoverResult,
  CriticalPatientInfo,
  PatientHandoverInfo,
  TaskHandoverInfo,
  HandoverWithRelations,
  SoapNoteSummary,
  VitalSignsSummary,
} from "./types";
import {
  validateCreateHandover,
  validateUpdateHandover,
  validateHandoverFilters,
  parseDateTime,
} from "./handoverValidation";
import { HandoverGenerator } from "./handoverGenerator";

export class HandoverService {
  private prisma: PrismaClient;
  private generator: HandoverGenerator;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.generator = new HandoverGenerator();
  }

  /**
   * Crea un nuevo handover
   *
   * @param data Datos del handover a crear
   * @param creatorId ID del médico que crea el handover
   * @returns Resultado con el handover creado o error
   */
  async create(data: CreateHandoverInput, creatorId: string): Promise<CreateHandoverReturn> {
    try {
      const validationResult = validateCreateHandover(data);
      if (!validationResult.success) {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: validationResult.error,
          statusCode: 400,
        };
        return { success: false, error };
      }

      const creator = await this.prisma.medicosProfile.findUnique({
        where: { userId: creatorId },
      });

      if (!creator) {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Médico creador no encontrado",
          statusCode: 404,
        };
        return { success: false, error };
      }

      if (creator.hospital !== data.hospital) {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "El handover debe crearse en el hospital del médico",
          statusCode: 400,
        };
        return { success: false, error };
      }

      const shiftDate = parseDateTime(data.shiftDate);
      const startTime = parseDateTime(data.startTime);
      const endTime = parseDateTime(data.endTime);

      if (!shiftDate || !startTime) {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "Fecha u hora inválida",
          statusCode: 400,
        };
        return { success: false, error };
      }

      const existingHandover = await this.prisma.handover.findFirst({
        where: {
          hospital: data.hospital,
          service: data.service,
          shiftType: data.shiftType,
          shiftDate: shiftDate,
          status: { in: ["DRAFT", "IN_PROGRESS"] },
        },
      });

      if (existingHandover) {
        const error: AppError = {
          code: ErrorCodes.DUPLICATE_ERROR,
          message: "Ya existe un handover en progreso para este turno",
          statusCode: 409,
        };
        return { success: false, error };
      }

      const handover = await this.prisma.handover.create({
        data: {
          hospital: data.hospital,
          service: data.service,
          shiftType: data.shiftType,
          shiftDate: shiftDate,
          startTime: startTime,
          endTime: endTime ?? null,
          createdBy: creator.id,
          status: "DRAFT",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return {
        success: true,
        handover: this.formatHandover(handover),
      };
    } catch (error) {
      console.error("Error en HandoverService.create:", error);
      if (error instanceof Error && (error as Error & { code?: string }).code === "P2002") {
        const appError: AppError = {
          code: ErrorCodes.DUPLICATE_ERROR,
          message: "Ya existe un handover con estos datos",
          statusCode: 409,
        };
        return { success: false, error: appError };
      }
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al crear el handover",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Obtiene un handover por su ID
   *
   * @param id ID del handover
   * @returns Resultado con el handover o error
   */
  async getById(id: string): Promise<GetHandoverResult> {
    try {
      const handover = await this.prisma.handover.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!handover) {
        return {
          success: false,
          error: {
            code: ErrorCodes.PATIENT_NOT_FOUND,
            message: "Handover no encontrado",
            statusCode: 404,
          },
        };
      }

      return {
        success: true,
        handover: this.formatHandover(handover),
      };
    } catch (error) {
      console.error("Error en HandoverService.getById:", error);
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Error al obtener el handover",
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Lista handovers con filtros
   *
   * @param filters Filtros para la búsqueda
   * @returns Resultado con la lista de handovers
   */
  async list(filters: HandoverFilters): Promise<ListHandoverResult> {
    try {
      const validationResult = validateHandoverFilters(filters);
      if (!validationResult.success) {
        console.error("Handover filters validation failed:", validationResult.error, "Filters:", filters);
        return {
          success: false,
          handovers: [],
          total: 0,
          page: 1,
          limit: 20,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: validationResult.error,
            statusCode: 400,
          },
        };
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (filters.hospital) {
        where.hospital = filters.hospital;
      }
      if (filters.service) {
        where.service = filters.service;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.createdBy) {
        where.createdBy = filters.createdBy;
      }
      if (filters.shiftDate) {
        const shiftDate = new Date(filters.shiftDate);
        where.shiftDate = shiftDate;
      }
      if (filters.shiftType) {
        where.shiftType = filters.shiftType;
      }

      const [handovers, total] = await Promise.all([
        this.prisma.handover.findMany({
          where,
          include: {
            creator: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        this.prisma.handover.count({ where }),
      ]);

      return {
        success: true,
        handovers: handovers.map((h) => this.formatHandover(h)),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error("Error en HandoverService.list:", error);
      return {
        success: false,
        handovers: [],
        total: 0,
        page: 1,
        limit: 20,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Error al listar los handovers",
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Actualiza un handover existente
   *
   * @param id ID del handover
   * @param data Datos a actualizar
   * @returns Resultado con el handover actualizado o error
   */
  async update(id: string, data: UpdateHandoverInput): Promise<UpdateHandoverResult> {
    try {
      const validationResult = validateUpdateHandover(data);
      if (!validationResult.success) {
        return {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: validationResult.error,
            statusCode: 400,
          },
        };
      }

      const existingHandover = await this.prisma.handover.findUnique({
        where: { id },
      });

      if (!existingHandover) {
        return {
          success: false,
          error: {
            code: ErrorCodes.PATIENT_NOT_FOUND,
            message: "Handover no encontrado",
            statusCode: 404,
          },
        };
      }

      if (existingHandover.status === "FINALIZED") {
        return {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "No se puede actualizar un handover FINALIZED",
            statusCode: 400,
          },
        };
      }

      const updateData: Record<string, unknown> = {};

      if (data.includedPatientIds !== undefined) {
        updateData.includedPatientIds = data.includedPatientIds;
      }
      if (data.includedTaskIds !== undefined) {
        updateData.includedTaskIds = data.includedTaskIds;
      }
      if (data.checklistItems !== undefined) {
        updateData.checklistItems = data.checklistItems;
      }
      if (data.generalNotes !== undefined) {
        updateData.generalNotes = data.generalNotes;
      }

      if (existingHandover.status === "DRAFT" && (data.includedPatientIds?.length ?? 0) > 0) {
        updateData.status = "IN_PROGRESS";
      }

      const handover = await this.prisma.handover.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return {
        success: true,
        handover: this.formatHandover(handover),
      };
    } catch (error) {
      console.error("Error en HandoverService.update:", error);
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Error al actualizar el handover",
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Finaliza un handover y genera el resumen automáticamente
   *
   * @param id ID del handover
   * @returns Resultado con el handover finalizado o error
   */
  async finalize(id: string): Promise<FinalizeHandoverResult> {
    try {
      const existingHandover = await this.prisma.handover.findUnique({
        where: { id },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      if (!existingHandover) {
        return {
          success: false,
          error: {
            code: ErrorCodes.PATIENT_NOT_FOUND,
            message: "Handover no encontrado",
            statusCode: 404,
          },
        };
      }

      if (existingHandover.status === "FINALIZED") {
        return {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "El handover ya está finalizado",
            statusCode: 400,
          },
        };
      }

      const patientIds = (existingHandover.includedPatientIds as string[]) ?? [];
      if (patientIds.length === 0) {
        return {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "No hay pacientes incluidos en el handover",
            statusCode: 400,
          },
        };
      }

      const patients = await this.getPatientsForHandover(patientIds);
      const tasks = await this.getTasksForHandover(
        (existingHandover.includedTaskIds as string[]) ?? []
      );

      const criticalPatients = await this.detectCriticalPatients(patientIds);

      const summaryResult = await this.generator.generateSummary(
        patients,
        tasks,
        criticalPatients
      );

      const handover = await this.prisma.handover.update({
        where: { id },
        data: {
          status: "FINALIZED",
          generatedSummary: summaryResult.markdown,
          criticalPatients: criticalPatients as unknown as Prisma.InputJsonValue,
          finalizedAt: new Date(),
          version: existingHandover.version + 1,
        },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return {
        success: true,
        handover: this.formatHandover(handover),
      };
    } catch (error) {
      console.error("Error en HandoverService.finalize:", error);
      return {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Error al finalizar el handover",
          statusCode: 500,
        },
      };
    }
  }

  /**
   * Detecta pacientes críticos basándose en criterios específicos
   *
   * @param patientIds IDs de pacientes a evaluar
   * @returns Lista de pacientes críticos con razones
   */
  async detectCriticalPatients(patientIds: string[]): Promise<CriticalPatientInfo[]> {
    const criticalPatients: CriticalPatientInfo[] = [];
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    for (const patientId of patientIds) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) continue;

      const tasks = await this.prisma.task.findMany({
        where: {
          patientId: patientId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          hospital: patient.hospital,
        },
        orderBy: { priority: "desc" },
      });

      const urgentTasks = tasks.filter((t) => t.priority === "URGENT");
      const highPriorityOverdueTasks = tasks.filter(
        (t) => t.priority === "HIGH" && t.dueDate && new Date(t.dueDate) < new Date()
      );

      const latestSoap = await this.prisma.soapNote.findFirst({
        where: {
          patientId: patientId,
          createdAt: { gte: twentyFourHoursAgo },
        },
        orderBy: { createdAt: "desc" },
      });

      const reasons: string[] = [];

      if (urgentTasks.length > 0) {
        reasons.push(
          `${urgentTasks.length} tarea(s) URGENTE pendiente(s): ${urgentTasks.map((t) => t.title).join(", ")}`
        );
      }

      if (highPriorityOverdueTasks.length > 0) {
        reasons.push(
          `${highPriorityOverdueTasks.length} tarea(s) HIGH vencida(s)`
        );
      }

      if (!latestSoap) {
        reasons.push("Sin nota SOAP en las últimas 24 horas");
      }

      if (reasons.length > 0) {
        criticalPatients.push({
          patientId: patientId,
          bedNumber: patient.bedNumber,
          patientName: `${patient.firstName} ${patient.lastName}`,
          reason: reasons.join(" | "),
          lastSoapDate: latestSoap?.createdAt,
          pendingTasksCount: tasks.length,
          urgentTasksCount: urgentTasks.length,
        });
      }
    }

    return criticalPatients.sort((a, b) => b.urgentTasksCount - a.urgentTasksCount);
  }

  /**
   * Obtiene información completa de pacientes para el handover
   */
  private async getPatientsForHandover(patientIds: string[]): Promise<PatientHandoverInfo[]> {
    const patients = await this.prisma.patient.findMany({
      where: { id: { in: patientIds } },
    });

    const patientsWithSoap: PatientHandoverInfo[] = [];

    for (const patient of patients) {
      const latestSoap = await this.prisma.soapNote.findFirst({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
      });

      const patientInfo: PatientHandoverInfo = {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        medicalRecordNumber: patient.medicalRecordNumber,
        bedNumber: patient.bedNumber,
        roomNumber: patient.roomNumber ?? undefined,
        diagnosis: patient.diagnosis,
        allergies: patient.allergies ?? undefined,
        bloodType: patient.bloodType ?? undefined,
        specialNotes: patient.specialNotes ?? undefined,
        admissionDate: patient.admissionDate,
      };

      if (latestSoap) {
        const vitalSignsData = latestSoap.vitalSigns as Record<string, unknown> | null;
        patientInfo.latestSoap = {
          id: latestSoap.id,
          date: latestSoap.createdAt,
          chiefComplaint: latestSoap.chiefComplaint,
          assessment: latestSoap.assessment,
          plan: latestSoap.plan,
          vitalSigns: vitalSignsData as VitalSignsSummary | undefined,
        };
      }

      patientsWithSoap.push(patientInfo);
    }

    return patientsWithSoap;
  }

  /**
   * Obtiene información de tareas para el handover
   */
  private async getTasksForHandover(taskIds: string[]): Promise<TaskHandoverInfo[]> {
    if (taskIds.length === 0) return [];

    const tasks = await this.prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: {
        assignee: {
          select: { fullName: true },
        },
      },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ?? undefined,
      patientId: task.patientId ?? undefined,
      assignedToName: task.assignee?.fullName,
    }));
  }

  /**
   * Formatea un handover de Prisma al formato del servicio
   */
  private formatHandover(
    handover: {
      id: string;
      hospital: string;
      service: string;
      shiftType: "MORNING" | "AFTERNOON" | "NIGHT";
      shiftDate: Date;
      startTime: Date;
      endTime: Date | null;
      createdBy: string;
      status: "DRAFT" | "IN_PROGRESS" | "FINALIZED";
      includedPatientIds: unknown;
      includedTaskIds: unknown;
      checklistItems: unknown;
      generalNotes: string | null;
      generatedSummary: string | null;
      criticalPatients: unknown | null;
      finalizedAt: Date | null;
      pdfUrl: string | null;
      version: number;
      createdAt: Date;
      updatedAt: Date;
      creator?: { id: string; fullName: string } | null;
    }
  ): HandoverWithRelations {
    return {
      id: handover.id,
      hospital: handover.hospital,
      service: handover.service,
      shiftType: handover.shiftType,
      shiftDate: handover.shiftDate,
      startTime: handover.startTime,
      endTime: handover.endTime ?? undefined,
      createdBy: handover.createdBy,
      creatorName: handover.creator?.fullName,
      status: handover.status,
      includedPatientIds: handover.includedPatientIds as string[],
      includedTaskIds: handover.includedTaskIds as string[],
      checklistItems: handover.checklistItems as Array<{
        id: string;
        description: string;
        isCompleted: boolean;
        completedBy?: string;
        completedAt?: Date;
        order: number;
      }>,
      generalNotes: handover.generalNotes ?? undefined,
      generatedSummary: handover.generatedSummary ?? undefined,
      criticalPatients: handover.criticalPatients as CriticalPatientInfo[] | undefined,
      finalizedAt: handover.finalizedAt ?? undefined,
      pdfUrl: handover.pdfUrl ?? undefined,
      version: handover.version,
      createdAt: handover.createdAt,
      updatedAt: handover.updatedAt,
    };
  }
}
