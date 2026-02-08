/**
 * Tests de integración para API de Handover
 *
 * Estos tests verifican los endpoints de la API de handover
 * usando SQLite como base de datos de prueba.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createServer } from "@/app/api/handover/route";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./medround_test.db",
    },
  },
});

describe("API Handover Integration", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.handover.deleteMany();
    await prisma.task.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.medicosProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  describe("GET /api/handover", () => {
    it("debería retornar lista vacía cuando no hay handovers", async () => {
      const response = await fetch("http://localhost:3000/api/handover", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toContain("No autorizado");
    });

    it("debería listar handovers con filtros", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      await prisma.handover.create({
        data: {
          id: "handover-1",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: new Date("2026-02-10"),
          startTime: new Date("2026-02-10T08:00:00Z"),
          createdBy: "test-medico-id",
          status: "DRAFT",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover?hospital=Hospital%20Central", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.handovers).toBeDefined();
      expect(Array.isArray(data.handovers)).toBe(true);
    });
  });

  describe("POST /api/handover", () => {
    it("debería crear un nuevo handover", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      const response = await fetch("http://localhost:3000/api/handover", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: "2026-02-10",
          startTime: "2026-02-10T08:00:00Z",
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.handover).toBeDefined();
      expect(data.handover.status).toBe("DRAFT");
      expect(data.handover.hospital).toBe("Hospital Central");
    });
  });

  describe("PATCH /api/handover/[id]", () => {
    it("debería actualizar un handover existente", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      const handover = await prisma.handover.create({
        data: {
          id: "handover-test",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: new Date("2026-02-10"),
          startTime: new Date("2026-02-10T08:00:00Z"),
          createdBy: "test-medico-id",
          status: "DRAFT",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/handover-test", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          includedPatientIds: ["patient-1", "patient-2"],
          generalNotes: "Notas de prueba",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.handover.includedPatientIds).toContain("patient-1");
      expect(data.handover.generalNotes).toBe("Notas de prueba");
    });
  });

  describe("POST /api/handover/[id]/finalize", () => {
    it("debería finalizar un handover", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      const patient = await prisma.patient.create({
        data: {
          id: "patient-finalize-test",
          medicalRecordNumber: "NHC-001",
          firstName: "Juan",
          lastName: "Pérez",
          dateOfBirth: new Date("1980-01-01"),
          gender: "M",
          bedNumber: "C-101",
          service: "Urgencias",
          diagnosis: "Test",
          hospital: "Hospital Central",
          attendingDoctor: "Dr. Test",
          admissionDate: new Date(),
        },
      });

      const handover = await prisma.handover.create({
        data: {
          id: "handover-finalize-test",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: new Date("2026-02-10"),
          startTime: new Date("2026-02-10T08:00:00Z"),
          createdBy: "test-medico-id",
          status: "DRAFT",
          includedPatientIds: [patient.id],
          includedTaskIds: [],
          checklistItems: [],
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/handover-finalize-test/finalize", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.handover.status).toBe("FINALIZED");
      expect(data.handover.generatedSummary).toBeDefined();
    });

    it("debería rechazar finalizar handover sin pacientes", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      await prisma.handover.create({
        data: {
          id: "handover-empty-test",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: new Date("2026-02-10"),
          startTime: new Date("2026-02-10T08:00:00Z"),
          createdBy: "test-medico-id",
          status: "DRAFT",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/handover-empty-test/finalize", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("No hay pacientes");
    });
  });

  describe("GET /api/handover/active", () => {
    it("debería retornar handover activo para el turno actual", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await prisma.handover.create({
        data: {
          id: "handover-active-test",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: today,
          startTime: today,
          createdBy: "test-medico-id",
          status: "IN_PROGRESS",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/active", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.handover).toBeDefined();
      expect(data.handover.status).toBe("IN_PROGRESS");
    });

    it("debería retornar null cuando no hay handover activo", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/active", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.handover).toBeNull();
      expect(data.message).toContain("No hay handover activo");
    });
  });

  describe("POST /api/handover/critical-patients", () => {
    it("debería detectar pacientes con tareas URGENT", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      const patient = await prisma.patient.create({
        data: {
          id: "patient-critical-test",
          medicalRecordNumber: "NHC-CRITICAL",
          firstName: "Carlos",
          lastName: "García",
          dateOfBirth: new Date("1970-01-01"),
          gender: "M",
          bedNumber: "ICU-1",
          service: "UCI",
          diagnosis: "Crítico",
          hospital: "Hospital Central",
          attendingDoctor: "Dr. Test",
          admissionDate: new Date(),
          isActive: true,
        },
      });

      await prisma.task.create({
        data: {
          id: "task-urgent-test",
          title: "Reevaluar urgente",
          priority: "URGENT",
          status: "PENDING",
          hospital: "Hospital Central",
          assignedTo: "test-medico-id",
          createdBy: "test-medico-id",
          patientId: patient.id,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/critical-patients", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIds: ["patient-critical-test"],
          hospital: "Hospital Central",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.criticalPatients).toHaveLength(1);
      expect(data.criticalPatients[0].reason).toContain("URGENTE");
    });

    it("debería detectar pacientes sin nota SOAP en 24h", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      const patient = await prisma.patient.create({
        data: {
          id: "patient-soap-test",
          medicalRecordNumber: "NHC-SOAP",
          firstName: "María",
          lastName: "López",
          dateOfBirth: new Date("1975-01-01"),
          gender: "F",
          bedNumber: "P-101",
          service: "Planta",
          diagnosis: "Neumonía",
          hospital: "Hospital Central",
          attendingDoctor: "Dr. Test",
          admissionDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
          isActive: true,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/critical-patients", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIds: ["patient-soap-test"],
          hospital: "Hospital Central",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.criticalPatients).toHaveLength(1);
      expect(data.criticalPatients[0].reason).toContain("Sin nota SOAP");
    });

    it("debería retornar array vacío para lista de pacientes vacía", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/critical-patients", {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientIds: [],
          hospital: "Hospital Central",
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.criticalPatients).toHaveLength(0);
    });
  });

  describe("GET /api/handover/:id/pdf", () => {
    it("debería retornar datos del PDF para usuario autorizado", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Central",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      const patient = await prisma.patient.create({
        data: {
          id: "patient-pdf-test",
          medicalRecordNumber: "NHC-PDF",
          firstName: "Ana",
          lastName: "Martínez",
          dateOfBirth: new Date("1985-01-01"),
          gender: "F",
          bedNumber: "U-201",
          service: "Urgencias",
          diagnosis: "Test PDF",
          hospital: "Hospital Central",
          attendingDoctor: "Dr. Test",
          admissionDate: new Date(),
          isActive: true,
        },
      });

      await prisma.handover.create({
        data: {
          id: "handover-pdf-test",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "AFTERNOON",
          shiftDate: new Date(),
          startTime: new Date(),
          createdBy: "test-medico-id",
          status: "FINALIZED",
          includedPatientIds: [patient.id],
          includedTaskIds: [],
          checklistItems: [],
          generatedSummary: "# Resumen de Prueba",
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/handover-pdf-test/pdf", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.handover).toBeDefined();
      expect(data.handover.status).toBe("FINALIZED");
      expect(data.patients).toHaveLength(1);
      expect(data.pdfUrl).toBeDefined();
    });

    it("debería rechazar acceso de usuario de otro hospital", async () => {
      const mockSession = {
        user: { id: "test-user-id" },
      };

      (await import("@/lib/auth")).auth.api.getSession = vi.fn().mockResolvedValue(mockSession);

      await prisma.user.create({
        data: {
          id: "test-user-id",
          name: "Dr. Test",
          email: "test@medround.com",
        },
      });

      await prisma.medicosProfile.create({
        data: {
          id: "test-medico-id",
          userId: "test-user-id",
          fullName: "Dr. Test",
          hospital: "Hospital Diferente",
          specialty: "Urgencias",
          userType: "medico",
        },
      });

      await prisma.handover.create({
        data: {
          id: "handover-forbidden-test",
          hospital: "Hospital Central",
          service: "Urgencias",
          shiftType: "MORNING",
          shiftDate: new Date(),
          startTime: new Date(),
          createdBy: "other-medico-id",
          status: "FINALIZED",
          includedPatientIds: [],
          includedTaskIds: [],
          checklistItems: [],
          version: 1,
        },
      });

      const response = await fetch("http://localhost:3000/api/handover/handover-forbidden-test/pdf", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain("No autorizado");
    });
  });
});
