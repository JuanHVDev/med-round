import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskPriority, TaskStatus } from "@/lib/schemas/taskSchema";
import type { TaskWithRelations } from "@/services/tasks/types";

export type { TaskWithRelations as Task } from "@/services/tasks/types";

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  type: string;
  patientId?: string;
  assignedTo: string;
  dueDate?: string;
  hospital: string;
  service?: string;
  shift?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  type?: string;
  patientId?: string | null;
  assignedTo?: string;
  dueDate?: string | null;
  hospital?: string;
  service?: string;
  shift?: string;
}

async function fetchTasks(filters?: {
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  search?: string;
}): Promise<TaskWithRelations[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.priority) params.set("priority", filters.priority);
  if (filters?.search) params.set("search", filters.search);

  const response = await fetch(`/api/tasks?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al obtener tareas");
  }

  const data = await response.json();
  return data.tasks || [];
}

async function fetchTask(id: string): Promise<TaskWithRelations> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error("Error al obtener la tarea");
  }

  const data = await response.json();
  return data.task;
}

async function createTask(data: CreateTaskData): Promise<TaskWithRelations> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al crear tarea");
  }

  const result = await response.json();
  return result.task;
}

async function updateTask(id: string, data: UpdateTaskData): Promise<TaskWithRelations> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al actualizar tarea");
  }

  const result = await response.json();
  return result.task;
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al eliminar tarea");
  }
}

async function completeTask(id: string): Promise<TaskWithRelations> {
  const response = await fetch(`/api/tasks/${id}/complete`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error al completar tarea");
  }

  const result = await response.json();
  return result.task;
}

export function useTasks(filters?: {
  status?: TaskStatus | "";
  priority?: TaskPriority | "";
  search?: string;
}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["tasks", id] });

      const previousTasks = queryClient.getQueryData<TaskWithRelations[]>(["tasks"]);
      const previousTask = queryClient.getQueryData<TaskWithRelations>(["tasks", id]);

      if (previousTasks) {
        queryClient.setQueryData<TaskWithRelations[]>(["tasks"], (old) => {
          if (!old) return [];
          return old.map((task) =>
            task.id === id ? { ...task, ...data } as TaskWithRelations : task
          );
        });
      }

      if (previousTask && data) {
        queryClient.setQueryData<TaskWithRelations>(["tasks", id], (old) => {
          if (!old) return undefined;
          return { ...old, ...data } as TaskWithRelations;
        });
      }

      return { previousTasks, previousTask };
    },
    onError: (error, { id }, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(["tasks", id], context.previousTask);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
