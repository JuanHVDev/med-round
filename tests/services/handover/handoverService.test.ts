/**
 * Tests unitarios para HandoverService
 *
 * Este archivo contiene los tests para el servicio de entrega de guardia.
 * Implementación TDD: Tests primero, código después.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";

const mockPrisma = {
  handover: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  patient: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  task: {
    findMany: vi.fn(),
  },
  soapNote: {
    findMany: vi.fn(),
  },
  medicosProfile: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("date-fns", () => ({
  format: vi.fn((date, format) => date.toISOString()),
  isAfter: vi.fn((date, compare) => date > compare),
  isBefore: vi.fn((date, compare) => date < compare),
  addHours: vi.fn((date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000)),
}));

describe("HandoverService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("create() - Crear handover", () => {
    it("debería crear un handover con datos válidos", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.medicosProfile.findUnique.mockResolvedValue({
        id: "medico-1",
        fullName: "Dr. García",
        hospital: "Hospital Central",
      });

      mockPrisma.handover.create.mockResolvedValue({
        id: "handover-1",
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        shiftDate: new Date("2026-02-10"),
        startTime: new Date("2026-02-10T08:00:00Z"),
        createdBy: "medico-1",
        status: "DRAFT",
        includedPatientIds: [],
        includedTaskIds: [],
        checklistItems: [],
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.create(
        {
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: "2026-02-10",
          startTime: "2026-02-10T08:00:00Z",
        },
        "medico-1"
      );

      expect(result.success).toBe(true);
      expect(result.handover).toBeDefined();
      expect(result.handover?.hospital).toBe("Hospital Central");
      expect(result.handover?.status).toBe("DRAFT");
    });

    it("debería rechazar si el médico no existe", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.medicosProfile.findUnique.mockResolvedValue(null);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.create(
        {
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: "2026-02-10",
          startTime: "2026-02-10T08:00:00Z",
        },
        "medico-inexistente"
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Médico no encontrado");
      expect(result.error?.statusCode).toBe(404);
    });

    it("debería rechazar datos inválidos - shiftType inválido", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.create(
        {
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "INVALID_SHIFT" as "MORNING",
          shiftDate: "2026-02-10",
          startTime: "2026-02-10T08:00:00Z",
        } as { hospital: string; service: string; shiftType: "MORNING" | "AFTERNOON" | "NIGHT"; shiftDate: string; startTime: string },
        "medico-1"
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("getById() - Obtener handover por ID", () => {
    it("debería obtener un handover existente con todas las relaciones", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findUnique.mockResolvedValue({
        id: "handover-1",
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        status: "DRAFT",
        includedPatientIds: [],
        includedTaskIds: [],
        checklistItems: [],
        createdBy: "medico-1",
        shiftDate: new Date(),
        startTime: new Date(),
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.getById("handover-1");

      expect(result.success).toBe(true);
      expect(result.handover).toBeDefined();
      expect(result.handover?.id).toBe("handover-1");
    });

    it("debería rechazar si el handover no existe", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findUnique.mockResolvedValue(null);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.getById("handover-inexistente");

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Handover no encontrado");
      expect(result.error?.statusCode).toBe(404);
    });
  });

  describe("list() - Listar handovers", () => {
    it("debería listar handovers filtrados por hospital y servicio", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findMany.mockResolvedValue([
        {
          id: "handover-1",
          hospital: "Hospital Central",
          service: "Urgencias",
          status: "DRAFT",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
          shiftType: "MORNING",
          shiftDate: new Date(),
          startTime: new Date(),
          createdBy: "medico-1",
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      mockPrisma.handover.count.mockResolvedValue(1);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.list({
        hospital: "Hospital Central",
        service: "Urgencias",
      });

      expect(result.success).toBe(true);
      expect(result.handovers).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockPrisma.handover.findMany).toHaveBeenCalled();
    });

    it("debería filtrar por estado", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findMany.mockResolvedValue([]);
      mockPrisma.handover.count.mockResolvedValue(0);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.list({
        hospital: "Hospital Central",
        status: "FINALIZED",
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.handover.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: "FINALIZED",
          }),
        })
      );
    });
  });

  describe("update() - Actualizar handover", () => {
    it("debería agregar pacientes a un handover", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findUnique.mockResolvedValue({
        id: "handover-1",
        status: "DRAFT",
        includedPatientIds: [],
        includedTaskIds: [],
        checklistItems: [],
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        shiftDate: new Date(),
        startTime: new Date(),
        createdBy: "medico-1",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.handover.update.mockResolvedValue({
        id: "handover-1",
        status: "DRAFT",
        includedPatientIds: ["patient-1", "patient-2"],
        includedTaskIds: [],
        checklistItems: [],
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        shiftDate: new Date(),
        startTime: new Date(),
        createdBy: "medico-1",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.update("handover-1", {
        includedPatientIds: ["patient-1", "patient-2"],
      });

      expect(result.success).toBe(true);
      expect(result.handover?.includedPatientIds).toContain("patient-1");
    });

    it("debería rechazar actualizaciones a handover FINALIZED", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findUnique.mockResolvedValue({
        id: "handover-1",
        status: "FINALIZED",
        includedPatientIds: [],
        includedTaskIds: [],
        checklistItems: [],
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        shiftDate: new Date(),
        startTime: new Date(),
        createdBy: "medico-1",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.update("handover-1", {
        includedPatientIds: ["patient-1"],
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("No se puede actualizar");
      expect(result.error?.message).toContain("FINALIZED");
    });
  });

  describe("finalize() - Finalizar handover", () => {
    it("debería finalizar un handover y generar resumen", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      const mockHandover = {
        id: "handover-1",
        status: "DRAFT",
        includedPatientIds: ["patient-1"],
        includedTaskIds: ["task-1"],
        checklistItems: [],
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        shiftDate: new Date("2026-02-10"),
        startTime: new Date("2026-02-10T08:00:00Z"),
        createdBy: "medico-1",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.handover.findUnique.mockResolvedValue(mockHandover);

      mockPrisma.patient.findMany.mockResolvedValue([
        {
          id: "patient-1",
          firstName: "Juan",
          lastName: "Pérez",
          bedNumber: "C-101",
          roomNumber: "Urgencias-1",
          diagnosis: "Infarto agudo de miocardio",
        },
      ]);

      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: "task-1",
          title: " ECG",
          priority: "URGENT",
          status: "PENDING",
          patientId: "patient-1",
        },
      ]);

      mockPrisma.soapNote.findMany.mockResolvedValue([
        {
          id: "soap-1",
          vitalSigns: {
            bloodPressure: "120/80",
            heartRate: 72,
            temperature: 36.5,
            oxygenSaturation: 98,
          },
          createdAt: new Date("2026-02-10T06:00:00Z"),
        },
      ]);

      mockPrisma.handover.update.mockResolvedValue({
        ...mockHandover,
        status: "FINALIZED",
        generatedSummary: "# Resumen de Guardia\n\n## Pacientes Críticos\n...",
        criticalPatients: [
          {
            patientId: "patient-1",
            bedNumber: "C-101",
            patientName: "Juan Pérez",
            reason: "Tarea URGENTE pendiente: ECG",
            pendingTasksCount: 1,
          },
        ],
        finalizedAt: new Date(),
        version: 2,
      });

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.finalize("handover-1");

      expect(result.success).toBe(true);
      expect(result.handover?.status).toBe("FINALIZED");
      expect(result.handover?.generatedSummary).toBeDefined();
      expect(mockPrisma.handover.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "handover-1" },
          data: expect.objectContaining({
            status: "FINALIZED",
            criticalPatients: expect.any(Array),
          }),
        })
      );
    });

    it("debería rechazar finalización de handover sin pacientes", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.handover.findUnique.mockResolvedValue({
        id: "handover-1",
        status: "DRAFT",
        includedPatientIds: [],
        includedTaskIds: [],
        checklistItems: [],
        hospital: "Hospital Central",
        service: "Urgencias",
        shiftType: "MORNING",
        shiftDate: new Date(),
        startTime: new Date(),
        createdBy: "medico-1",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.finalize("handover-1");

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("No hay pacientes");
    });
  });

  describe("detectCriticalPatients() - Detectar pacientes críticos", () => {
    it("debería identificar pacientes con tareas URGENT pendientes", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: "task-1",
          title: " ECG urgente",
          priority: "URGENT",
          status: "PENDING",
          patient: {
            id: "patient-1",
            firstName: "María",
            lastName: "García",
            bedNumber: "C-205",
          },
        },
      ]);

      mockPrisma.soapNote.findMany.mockResolvedValue([]);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.detectCriticalPatients(["patient-1"]);

      expect(result).toHaveLength(1);
      expect(result[0].bedNumber).toBe("C-205");
      expect(result[0].reason).toContain("URGENT");
    });

    it("debería identificar pacientes con tareas HIGH vencidas", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockPrisma.task.findMany.mockResolvedValue([
        {
          id: "task-2",
          title: "Solicitar TAC",
          priority: "HIGH",
          status: "PENDING",
          dueDate: yesterday,
          patient: {
            id: "patient-2",
            firstName: "Carlos",
            lastName: "Ruiz",
            bedNumber: "C-302",
          },
        },
      ]);

      mockPrisma.soapNote.findMany.mockResolvedValue([]);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.detectCriticalPatients(["patient-2"]);

      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain("vencida");
    });

    it("debería identificar pacientes sin notas SOAP en 24h", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.soapNote.findMany.mockResolvedValue([]);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.detectCriticalPatients(["patient-3"]);

      expect(result).toHaveLength(1);
      expect(result[0].reason).toContain("sin nota SOAP");
    });

    it("debería retornar array vacío cuando no hay pacientes críticos", async () => {
      const { HandoverService } = await import("@/services/handover/handoverService");

      mockPrisma.task.findMany.mockResolvedValue([]);

      const recentSoap = new Date();
      recentSoap.setHours(recentSoap.getHours() - 2);
      mockPrisma.soapNote.findMany.mockResolvedValue([
        {
          id: "soap-recent",
          vitalSigns: { bloodPressure: "110/70" },
          createdAt: recentSoap,
        },
      ]);

      const service = new HandoverService(mockPrisma as unknown as PrismaClient);
      const result = await service.detectCriticalPatients(["patient-4"]);

      expect(result).toHaveLength(0);
    });
  });

  describe("generateSummary() - Generar resumen", () => {
    it("debería generar resumen en formato markdown estructurado", async () => {
      const { HandoverGenerator } = await import("@/services/handover/handoverGenerator");

      const patients = [
        {
          id: "patient-1",
          firstName: "Ana",
          lastName: "López",
          bedNumber: "C-101",
          roomNumber: "Urgencias-1",
          diagnosis: "Neumonía",
        },
      ];

      const tasks = [
        {
          id: "task-1",
          title: "Radiografía de tórax",
          priority: "HIGH",
          status: "PENDING",
          patientId: "patient-1",
        },
      ];

      const soapNotes = [
        {
          id: "soap-1",
          vitalSigns: {
            bloodPressure: "120/80",
            heartRate: 80,
            temperature: 38.2,
            oxygenSaturation: 94,
          },
          createdAt: new Date("2026-02-10T06:00:00Z"),
        },
      ];

      const generator = new HandoverGenerator();
      const summary = await generator.generateSummary(patients, tasks, soapNotes);

      expect(summary).toContain("# Resumen de Guardia");
      expect(summary).contain("C-101");
      expect(summary).contain("Ana López");
      expect(summary).contain("120/80");
      expect(summary).contain("38.2");
    });

    it("debería incluir sección de constantes vitales", async () => {
      const { HandoverGenerator } = await import("@/services/handover/handoverGenerator");

      const patients = [
        {
          id: "patient-1",
          firstName: "Pedro",
          lastName: "Sánchez",
          bedNumber: "C-201",
          roomNumber: "Urgencias-2",
          diagnosis: "Dolor abdominal",
        },
      ];

      const tasks: Array<{
        id: string;
        title: string;
        priority: string;
        status: string;
        patientId: string;
      }> = [];

      const soapNotes = [
        {
          id: "soap-1",
          vitalSigns: {
            bloodPressure: "130/85",
            heartRate: 90,
            temperature: 37.0,
            oxygenSaturation: 97,
            respiratoryRate: 18,
          },
          createdAt: new Date("2026-02-10T07:00:00Z"),
        },
      ];

      const generator = new HandoverGenerator();
      const summary = await generator.generateSummary(patients, tasks, soapNotes);

      expect(summary).toContain("Constantes Vitales");
      expect(summary).toContain("130/85");
      expect(summary).toContain("90 lpm");
      expect(summary).toContain("97%");
    });
  });
});
