/**
 * Tipos para el servicio de tareas
 *
 * Define las interfaces de datos para:
 * - Creación de tarea
 * - Actualización de tarea
 * - Filtros de búsqueda
 * - Respuestas del servicio
 */

import type {
  TaskPriority,
  TaskStatus,
  TaskType,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/lib/schemas/taskSchema";

export type { TaskPriority, TaskStatus, TaskType, CreateTaskInput, UpdateTaskInput };

export interface TaskFilters {
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  patientId?: string;
  assignedTo?: string;
  hospital: string;
  search?: string;
  page: number;
  limit: number;
}

export interface TaskWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
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
  assignee?: {
    id: string;
    fullName: string;
  };
  creator?: {
    id: string;
    fullName: string;
  };
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    bedNumber: string;
    roomNumber: string | null;
  };
  checklist?: Array<{
    id: string;
    description: string;
    isCompleted: boolean;
    order: number;
  }>;
}

export interface CreateTaskSuccess {
  success: true;
  task: TaskWithRelations;
}

export interface GetTaskSuccess {
  success: true;
  task: TaskWithRelations;
}

export interface ListTasksSuccess {
  success: true;
  tasks: TaskWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateTaskSuccess {
  success: true;
  task: TaskWithRelations;
}

export interface TaskOperationSuccess {
  success: true;
}

export interface TaskServiceError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: string;
  };
}

export type CreateTaskResult = CreateTaskSuccess | TaskServiceError;
export type GetTaskResult = GetTaskSuccess | TaskServiceError;
export type ListTasksResult = ListTasksSuccess | TaskServiceError;
export type UpdateTaskResult = UpdateTaskSuccess | TaskServiceError;
export type TaskOperationResult = TaskOperationSuccess | TaskServiceError;
