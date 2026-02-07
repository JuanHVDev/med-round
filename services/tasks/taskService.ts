import { PrismaClient } from "@prisma/client";
import {
  ErrorCodes,
  type AppError,
} from "@/lib/errors";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  CreateTaskResult,
  GetTaskResult,
  ListTasksResult,
  UpdateTaskResult,
  TaskOperationResult,
  TaskWithRelations,
} from "./types";
import { validateCreateTask, validateUpdateTask, validateTaskFilters, parseDueDate } from "./taskValidation";

/**
 * Servicio para gestión de tareas (Kanban)
 *
 * Proporciona operaciones CRUD para tareas médicas:
 * - Crear tarea con validación de asignación
 * - Obtener tarea por ID
 * - Listar tareas con filtros (status, priority, assignedTo, patientId)
 * - Actualizar datos de la tarea
 * - Eliminar tarea (soft delete)
 * - Completar tarea
 * - Reasignar tarea
 */
export class TaskService
{
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient)
  {
    this.prisma = prisma;
  }

  /**
   * Crea una nueva tarea
   *
   * @param data Datos de la tarea
   * @param creatorId ID del médico que crea la tarea
   * @returns Resultado con la tarea creada o error
   */
  async create(data: CreateTaskInput, creatorId: string): Promise<CreateTaskResult>
  {
    try
    {
      const validationResult = validateCreateTask(data);
      if (!validationResult.success)
      {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: validationResult.error,
          statusCode: 400,
        };
        return { success: false, error };
      }

      const assignee = await this.prisma.medicosProfile.findUnique({
        where: { id: data.assignedTo },
      });

      if (!assignee)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Médico asignado no encontrado",
          statusCode: 404,
        };
        return { success: false, error };
      }

      if (assignee.hospital !== data.hospital)
      {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "El médico asignado debe pertenecer al mismo hospital",
          statusCode: 400,
          details: `Hospital de la tarea: ${data.hospital}, Hospital del asignado: ${assignee.hospital}`,
        };
        return { success: false, error };
      }

      let patientId: string | undefined = undefined;
      if (data.patientId)
      {
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
        patientId = patient.id;
      }

      const dueDate = parseDueDate(data.dueDate);

      const task = await this.prisma.task.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          priority: data.priority,
          type: data.type,
          patientId: patientId ?? null,
          assignedTo: data.assignedTo,
          createdBy: creatorId,
          dueDate,
          hospital: data.hospital,
          service: data.service ?? null,
          shift: data.shift ?? null,
        },
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
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

      return {
        success: true,
        task: this.formatTask(task),
      };
    }
    catch (error)
    {
      if (error instanceof Error && (error as Error & { code?: string }).code === "P2002")
      {
        const appError: AppError = {
          code: ErrorCodes.DUPLICATE_ERROR,
          message: "Ya existe una tarea con estos datos",
          statusCode: 409,
        };
        return { success: false, error: appError };
      }

      console.error("Error en TaskService.create:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al crear la tarea",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Obtiene una tarea por su ID
   *
   * @param id ID de la tarea
   * @returns Resultado con la tarea o error
   */
  async getById(id: string): Promise<GetTaskResult>
  {
    try
    {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bedNumber: true,
              roomNumber: true,
            },
          },
          checklist: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!task)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Tarea no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      return {
        success: true,
        task: this.formatTask(task),
      };
    }
    catch (error)
    {
      console.error("Error en TaskService.getById:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al obtener la tarea",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Lista tareas con filtros y paginación
   *
   * @param filters Filtros para la búsqueda
   * @returns Resultado con la lista de tareas o error
   */
  async list(filters: TaskFilters): Promise<ListTasksResult>
  {
    try
    {
      const validationResult = validateTaskFilters(filters);
      if (!validationResult.success)
      {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: validationResult.error,
          statusCode: 400,
        };
        return { success: false, error };
      }

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};

      if (filters.hospital)
      {
        where.hospital = filters.hospital;
      }

      if (filters.status)
      {
        where.status = filters.status;
      }

      if (filters.priority)
      {
        where.priority = filters.priority;
      }

      if (filters.patientId)
      {
        where.patientId = filters.patientId;
      }

      if (filters.assignedTo)
      {
        where.assignedTo = filters.assignedTo;
      }

      if (filters.search)
      {
        where.OR = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const [tasks, total] = await Promise.all([
        this.prisma.task.findMany({
          where,
          include: {
            assignee: {
              select: {
                id: true,
                fullName: true,
              },
            },
            creator: {
              select: {
                id: true,
                fullName: true,
              },
            },
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
          orderBy: [
            { priority: "desc" },
            { createdAt: "desc" },
          ],
          skip,
          take: limit,
        }),
        this.prisma.task.count({ where }),
      ]);

      return {
        success: true,
        tasks: tasks.map((task) => this.formatTask(task)),
        total,
        page,
        limit,
      };
    }
    catch (error)
    {
      console.error("Error en TaskService.list:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al listar las tareas",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Actualiza una tarea existente
   *
   * @param id ID de la tarea a actualizar
   * @param data Datos a actualizar
   * @returns Resultado con la tarea actualizada o error
   */
  async update(id: string, data: UpdateTaskInput): Promise<UpdateTaskResult>
  {
    try
    {
      const validationResult = validateUpdateTask(data);
      if (!validationResult.success)
      {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: validationResult.error,
          statusCode: 400,
        };
        return { success: false, error };
      }

      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Tarea no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      if (data.assignedTo)
      {
        const assignee = await this.prisma.medicosProfile.findUnique({
          where: { id: data.assignedTo },
        });

        if (!assignee)
        {
          const error: AppError = {
            code: ErrorCodes.PATIENT_NOT_FOUND,
            message: "Médico asignado no encontrado",
            statusCode: 404,
          };
          return { success: false, error };
        }

        const hospitalToCheck = data.hospital || existingTask.hospital;
        if (assignee.hospital !== hospitalToCheck)
        {
          const error: AppError = {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "El médico asignado debe pertenecer al mismo hospital",
            statusCode: 400,
          };
          return { success: false, error };
        }
      }

      const dueDate = parseDueDate(data.dueDate);

      const updateData: Record<string, unknown> = { ...data };
      if (dueDate !== undefined)
      {
        updateData.dueDate = dueDate;
      }

      if (data.description === null)
      {
        updateData.description = null;
      }

      const task = await this.prisma.task.update({
        where: { id },
        data: updateData,
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
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

      return {
        success: true,
        task: this.formatTask(task),
      };
    }
    catch (error)
    {
      console.error("Error en TaskService.update:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al actualizar la tarea",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Completa una tarea
   *
   * @param id ID de la tarea
   * @returns Resultado de la operación o error
   */
  async complete(id: string): Promise<UpdateTaskResult>
  {
    try
    {
      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Tarea no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      if (existingTask.status === "COMPLETED")
      {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "La tarea ya está completada",
          statusCode: 400,
        };
        return { success: false, error };
      }

      const task = await this.prisma.task.update({
        where: { id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
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

      return {
        success: true,
        task: this.formatTask(task),
      };
    }
    catch (error)
    {
      console.error("Error en TaskService.complete:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al completar la tarea",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Elimina una tarea (soft delete)
   *
   * @param id ID de la tarea a eliminar
   * @returns Resultado de la operación o error
   */
  async delete(id: string): Promise<TaskOperationResult>
  {
    try
    {
      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Tarea no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      await this.prisma.task.delete({
        where: { id },
      });

      return { success: true };
    }
    catch (error)
    {
      console.error("Error en TaskService.delete:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al eliminar la tarea",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  /**
   * Reasigna una tarea a otro médico
   *
   * @param id ID de la tarea
   * @param newAssigneeId ID del nuevo asignado
   * @returns Resultado con la tarea actualizada o error
   */
  async reassign(id: string, newAssigneeId: string): Promise<UpdateTaskResult>
  {
    try
    {
      const existingTask = await this.prisma.task.findUnique({
        where: { id },
      });

      if (!existingTask)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Tarea no encontrada",
          statusCode: 404,
        };
        return { success: false, error };
      }

      const newAssignee = await this.prisma.medicosProfile.findUnique({
        where: { id: newAssigneeId },
      });

      if (!newAssignee)
      {
        const error: AppError = {
          code: ErrorCodes.PATIENT_NOT_FOUND,
          message: "Médico asignado no encontrado",
          statusCode: 404,
        };
        return { success: false, error };
      }

      if (newAssignee.hospital !== existingTask.hospital)
      {
        const error: AppError = {
          code: ErrorCodes.VALIDATION_ERROR,
          message: "El médico asignado debe pertenecer al mismo hospital",
          statusCode: 400,
        };
        return { success: false, error };
      }

      const task = await this.prisma.task.update({
        where: { id },
        data: {
          assignedTo: newAssigneeId,
          status: "PENDING",
        },
        include: {
          assignee: {
            select: {
              id: true,
              fullName: true,
            },
          },
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
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

      return {
        success: true,
        task: this.formatTask(task),
      };
    }
    catch (error)
    {
      console.error("Error en TaskService.reassign:", error);
      const appError: AppError = {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Error al reasignar la tarea",
        statusCode: 500,
      };
      return { success: false, error: appError };
    }
  }

  private formatTask(task: {
    id: string;
    title: string;
    description: string | null;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    type: "LABORATORY" | "IMAGING" | "CONSULT" | "PROCEDURE" | "MEDICATION" | "OTHER";
    patientId: string | null;
    assignedTo: string;
    createdBy: string;
    dueDate: Date | null;
    completedAt: Date | null;
    hospital: string;
    service: string | null;
    shift: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignee?: { id: string; fullName: string } | null;
    creator?: { id: string; fullName: string } | null;
    patient?: { id: string; firstName: string; lastName: string; bedNumber: string; roomNumber: string | null } | null;
    checklist?: Array<{ id: string; description: string; isCompleted: boolean; order: number }>;
  }): TaskWithRelations
  {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      type: task.type,
      patientId: task.patientId,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      hospital: task.hospital,
      service: task.service,
      shift: task.shift,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      assignee: task.assignee ?? undefined,
      creator: task.creator ?? undefined,
      patient: task.patient ?? undefined,
      checklist: task.checklist ?? undefined,
    };
  }
}
