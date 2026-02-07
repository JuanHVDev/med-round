import { describe, it, expect, beforeEach, vi } from "vitest";

describe("TaskService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("creación de tarea", () => {
    it("debería crear una tarea con datos válidos", async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        success: true,
        task: {
          id: "task-123",
          title: "Ordenar biometría hemática",
          status: "PENDING",
          priority: "HIGH",
        },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { create: typeof mockCreate } };
      const service = new MockedTaskService();
      
      const result = await service.create(
        {
          title: "Ordenar biometría hemática",
          priority: "HIGH",
          type: "LABORATORY",
          assignedTo: "223e4567-e89b-12d3-a456-426614174001",
          hospital: "Hospital General",
        },
        "creator-123"
      );

      expect(result.success).toBe(true);
      expect(result.task?.id).toBe("task-123");
    });

    it("debería rechazar tarea sin campos requeridos", async () => {
      const mockCreate = vi.fn().mockResolvedValue({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "El título es requerido",
          statusCode: 400,
        },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { create: typeof mockCreate } };
      const service = new MockedTaskService();
      
      const result = await service.create(
        { title: "", assignedTo: "", hospital: "" } as { title: string; assignedTo: string; hospital: string },
        "creator-123"
      );

      expect(result.success).toBe(false);
    });
  });

  describe("obtener tarea por ID", () => {
    it("debería obtener tarea existente", async () => {
      const mockGetById = vi.fn().mockResolvedValue({
        success: true,
        task: { id: "task-123", title: "Tarea de prueba", status: "PENDING" },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { getById: typeof mockGetById } };
      const service = new MockedTaskService();
      
      const result = await service.getById("task-123");

      expect(result.success).toBe(true);
      expect(result.task?.id).toBe("task-123");
    });
  });

  describe("listar tareas", () => {
    it("debería listar tareas con filtros", async () => {
      const mockList = vi.fn().mockResolvedValue({
        success: true,
        tasks: [{ id: "task-1", status: "PENDING" }],
        total: 1,
        page: 1,
        limit: 20,
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { list: typeof mockList } };
      const service = new MockedTaskService();
      
      const result = await service.list({
        hospital: "Hospital General",
        page: 1,
        limit: 20,
      });

      expect(result.success).toBe(true);
      expect(result.tasks?.length).toBe(1);
    });
  });

  describe("actualizar tarea", () => {
    it("debería actualizar tarea existente", async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        success: true,
        task: { id: "task-123", title: "Título actualizado", priority: "URGENT" },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { update: typeof mockUpdate } };
      const service = new MockedTaskService();
      
      const result = await service.update("task-123", {
        title: "Título actualizado",
        priority: "URGENT",
      });

      expect(result.success).toBe(true);
      expect(result.task?.title).toBe("Título actualizado");
    });
  });

  describe("completar tarea", () => {
    it("debería completar tarea pendiente", async () => {
      const mockComplete = vi.fn().mockResolvedValue({
        success: true,
        task: { id: "task-123", status: "COMPLETED", completedAt: new Date() },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { complete: typeof mockComplete } };
      const service = new MockedTaskService();
      
      const result = await service.complete("task-123");

      expect(result.success).toBe(true);
      expect(result.task?.status).toBe("COMPLETED");
    });

    it("debería rechazar completar tarea ya completada", async () => {
      const mockComplete = vi.fn().mockResolvedValue({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "La tarea ya está completada", statusCode: 400 },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { complete: typeof mockComplete } };
      const service = new MockedTaskService();
      
      const result = await service.complete("task-123");

      expect(result.success).toBe(false);
    });
  });

  describe("eliminar tarea", () => {
    it("debería eliminar tarea existente", async () => {
      const mockDelete = vi.fn().mockResolvedValue({ success: true });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { delete: typeof mockDelete } };
      const service = new MockedTaskService();
      
      const result = await service.delete("task-123");

      expect(result.success).toBe(true);
    });

    it("debería rechazar eliminación de tarea inexistente", async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        success: false,
        error: { code: "PATIENT_NOT_FOUND", message: "Tarea no encontrada", statusCode: 404 },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { delete: typeof mockDelete } };
      const service = new MockedTaskService();
      
      const result = await service.delete("task-inexistente");

      expect(result.success).toBe(false);
    });
  });

  describe("reasignar tarea", () => {
    it("debería reasignar tarea a otro médico", async () => {
      const mockReassign = vi.fn().mockResolvedValue({
        success: true,
        task: { id: "task-123", assignedTo: "nuevo-id", status: "PENDING" },
      });

      const { TaskService } = await import("@/services/tasks/taskService");
      const MockedTaskService = TaskService as unknown as { new (): { reassign: typeof mockReassign } };
      const service = new MockedTaskService();
      
      const result = await service.reassign("task-123", "nuevo-id");

      expect(result.success).toBe(true);
      expect(result.task?.assignedTo).toBe("nuevo-id");
    });
  });
});
