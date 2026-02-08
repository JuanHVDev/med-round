import { describe, it, expect } from "vitest";
import {
  PRIORITIES,
  TASK_STATUS,
  USER_ROLES,
  SHIFTS,
  PAGINATION,
  API_ROUTES,
  NAVIGATION,
  VALIDATION,
  TOAST_DURATION,
} from "@/lib/utils/constants";

describe("constants", () => {
  describe("PRIORITIES", () => {
    it("should have priority levels", () => {
      expect(PRIORITIES.URGENTE).toBe("urgente");
      expect(PRIORITIES.ALTA).toBe("alta");
      expect(PRIORITIES.MEDIA).toBe("media");
      expect(PRIORITIES.BAJA).toBe("baja");
    });

    it("should have ordered priorities array", () => {
      expect(PRIORITIES.ORDERED).toContain("urgente");
      expect(PRIORITIES.ORDERED).toContain("alta");
      expect(PRIORITIES.ORDERED).toContain("media");
      expect(PRIORITIES.ORDERED).toContain("baja");
      expect(PRIORITIES.ORDERED.length).toBe(4);
    });
  });

  describe("TASK_STATUS", () => {
    it("should have all task statuses", () => {
      expect(TASK_STATUS.PENDIENTE).toBe("pendiente");
      expect(TASK_STATUS.EN_PROGRESO).toBe("en_progreso");
      expect(TASK_STATUS.COMPLETADA).toBe("completada");
      expect(TASK_STATUS.CANCELADA).toBe("cancelada");
    });

    it("should have ordered statuses for kanban", () => {
      const kanbanOrder = TASK_STATUS.KANBAN_ORDER;
      expect(kanbanOrder[0]).toBe("pendiente");
      expect(kanbanOrder[1]).toBe("en_progreso");
      expect(kanbanOrder[2]).toBe("completada");
      expect(kanbanOrder[3]).toBe("cancelada");
    });
  });

  describe("USER_ROLES", () => {
    it("should have all user roles", () => {
      expect(USER_ROLES.ADMIN).toBe("admin");
      expect(USER_ROLES.MEDICO).toBe("medico");
      expect(USER_ROLES.ENFERMERO).toBe("enfermero");
    });
  });

  describe("SHIFTS", () => {
    it("should have all shifts", () => {
      expect(SHIFTS.MORNING).toBe("morning");
      expect(SHIFTS.AFTERNOON).toBe("afternoon");
      expect(SHIFTS.NIGHT).toBe("night");
    });

    it("should have shift labels", () => {
      expect(SHIFTS.LABELS.morning).toBe("Mañana");
      expect(SHIFTS.LABELS.afternoon).toBe("Tarde");
      expect(SHIFTS.LABELS.night).toBe("Noche");
    });

    it("should have shift hours", () => {
      expect(SHIFTS.HOURS.morning.start).toBe(7);
      expect(SHIFTS.HOURS.morning.end).toBe(15);
      expect(SHIFTS.HOURS.afternoon.start).toBe(15);
      expect(SHIFTS.HOURS.afternoon.end).toBe(23);
      expect(SHIFTS.HOURS.night.start).toBe(23);
      expect(SHIFTS.HOURS.night.end).toBe(7);
    });
  });

  describe("PAGINATION", () => {
    it("should have default page size", () => {
      expect(PAGINATION.DEFAULT_PAGE_SIZE).toBe(10);
    });

    it("should have page size options", () => {
      expect(PAGINATION.PAGE_SIZE_OPTIONS).toContain(10);
      expect(PAGINATION.PAGE_SIZE_OPTIONS).toContain(25);
      expect(PAGINATION.PAGE_SIZE_OPTIONS).toContain(50);
    });
  });

  describe("API_ROUTES", () => {
    it("should have correct API routes", () => {
      expect(API_ROUTES.PATIENTS).toBe("/api/patients");
      expect(API_ROUTES.SOAP_NOTES).toBe("/api/soap-notes");
      expect(API_ROUTES.TASKS).toBe("/api/tasks");
      expect(API_ROUTES.HANDOVER).toBe("/api/handover");
    });
  });

  describe("NAVIGATION", () => {
    it("should have navigation routes", () => {
      expect(NAVIGATION.DASHBOARD).toBe("/dashboard");
      expect(NAVIGATION.PATIENTS).toBe("/patients");
      expect(NAVIGATION.TASKS).toBe("/tasks");
      expect(NAVIGATION.HANDOVER).toBe("/handover");
    });
  });

  describe("VALIDATION", () => {
    it("should have validation rules", () => {
      expect(VALIDATION.MIN_PASSWORD_LENGTH).toBe(8);
      expect(VALIDATION.MAX_PATIENTS_PER_PAGE).toBe(100);
      expect(VALIDATION.MAX_NOTE_LENGTH).toBe(10000);
    });
  });

  describe("TOAST_DURATION", () => {
    it("should have toast duration in ms", () => {
      expect(TOAST_DURATION.DEFAULT).toBe(4000);
      expect(TOAST_DURATION.SHORT).toBe(2000);
      expect(TOAST_DURATION.LONG).toBe(7000);
    });
  });
});
