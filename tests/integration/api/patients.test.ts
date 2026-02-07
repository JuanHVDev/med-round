import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/patients/route";
import { GET as GET_ID, PATCH as PATCH_ID, DELETE as DELETE_ID } from "@/app/api/patients/[id]/route";
import { prisma } from "@/lib/prisma";
import type { CreatePatientData } from "@/services/patient/types";

const mockGetSession = vi.hoisted(() => vi.fn<() => Promise<{ user: { id: string; name: string; email: string } } | null>>());

vi.mock("@/lib/auth", async () => {
  const actual = await vi.importActual("@/lib/auth");
  return {
    ...actual as object,
    auth: {
      api: {
        getSession: mockGetSession,
      },
    },
  };
});

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({
    allowed: true,
    remaining: 9,
    resetTime: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn((remaining: number, resetTime: number) => ({
    "X-RateLimit-Limit": "10",
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  })),
}));

describe("API Pacientes - Integración", () => {
  const hospitalName = `Hospital Test ${Date.now()}`;
  let createdPatientId: string;

  const getValidPatientData = (): CreatePatientData => ({
    medicalRecordNumber: `HC-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    firstName: "Juan",
    lastName: "Pérez",
    dateOfBirth: "1990-01-01T00:00:00.000Z",
    gender: "M",
    admissionDate: "2024-01-01T00:00:00.000Z",
    bedNumber: "101A",
    roomNumber: "101",
    service: "Medicina Interna",
    diagnosis: "Neumonía",
    allergies: "Ninguna",
    hospital: hospitalName,
    attendingDoctor: "Dr. García",
    isActive: true,
  });

  beforeEach(async () => {
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({
      user: {
        id: "test-user-123",
        name: "Test User",
        email: "test@example.com",
      },
    });
  });

  afterEach(async () => {
    if (createdPatientId) {
      await prisma.patient.deleteMany({
        where: { id: createdPatientId },
      }).catch(() => {});
    }
    await prisma.patient.deleteMany({
      where: { hospital: hospitalName },
    }).catch(() => {});
  });

  describe("POST /api/patients", () => {
    it("debería crear un paciente con datos válidos", async () => {
      const request = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValidPatientData()),
      });

      const response = await POST(request);
      const data = await response.json() as { patient: { id: string; firstName: string } };

      expect(response.status).toBe(201);
      expect(data.patient).toBeDefined();
      expect(data.patient.firstName).toBe("Juan");
      createdPatientId = data.patient.id;
    });

    it("debería rechazar datos inválidos", async () => {
      const invalidData = {
        medicalRecordNumber: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        admissionDate: "",
        bedNumber: "",
        service: "",
        diagnosis: "",
        allergies: "",
        hospital: "",
        attendingDoctor: "",
      };

      const request = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("debería rechazar medicalRecordNumber duplicado", async () => {
      const patientData = getValidPatientData();
      patientData.medicalRecordNumber = `HC-DUPLICATE-${Date.now()}`;

      const request1 = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });

      const response1 = await POST(request1);
      expect(response1.status).toBe(201);
      createdPatientId = (await response1.json()).patient.id;

      const request2 = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });

      const response2 = await POST(request2);
      expect(response2.status).toBe(409);
    });

    it("debería requerir autenticación", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValidPatientData()),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/patients", () => {
    beforeEach(async () => {
      const patient = await prisma.patient.create({
        data: {
          ...getValidPatientData(),
          hospital: hospitalName,
          dateOfBirth: new Date("1990-01-01"),
          admissionDate: new Date(),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería listar pacientes del hospital", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/patients?hospital=${encodeURIComponent(hospitalName)}`
      );

      const response = await GET(request);
      const data = await response.json() as { patients: unknown[]; total: number };

      expect(response.status).toBe(200);
      expect(data.patients).toBeDefined();
      expect(Array.isArray(data.patients)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);
    });

    it("debería filtrar por estado activo", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/patients?hospital=${encodeURIComponent(hospitalName)}&isActive=true`
      );

      const response = await GET(request);
      const data = await response.json() as { patients: unknown[] };

      expect(response.status).toBe(200);
      expect(data.patients.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/patients/:id", () => {
    beforeEach(async () => {
      const patient = await prisma.patient.create({
        data: {
          ...getValidPatientData(),
          hospital: hospitalName,
          dateOfBirth: new Date("1990-01-01"),
          admissionDate: new Date(),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería obtener un paciente por ID", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`
      );

      const params = Promise.resolve({ id: createdPatientId });
      const response = await GET_ID(request, { params });
      const data = await response.json() as { patient: { id: string; firstName: string } };

      expect(response.status).toBe(200);
      expect(data.patient).toBeDefined();
      expect(data.patient.id).toBe(createdPatientId);
    });

    it("debería devolver 404 para paciente no existente", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const request = new NextRequest(`http://localhost:3000/api/patients/${fakeId}`);

      const params = Promise.resolve({ id: fakeId });
      const response = await GET_ID(request, { params });

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH /api/patients/:id", () => {
    beforeEach(async () => {
      const patient = await prisma.patient.create({
        data: {
          ...getValidPatientData(),
          hospital: hospitalName,
          dateOfBirth: new Date("1990-01-01"),
          admissionDate: new Date(),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería actualizar un paciente", async () => {
      const updateData = {
        diagnosis: "Neumonía bacteriana actualizada",
        attendingDoctor: "Dr. Smith",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const params = Promise.resolve({ id: createdPatientId });
      const response = await PATCH_ID(request, { params });
      const data = await response.json() as { patient: { diagnosis: string; attendingDoctor: string } };

      expect(response.status).toBe(200);
      expect(data.patient.diagnosis).toBe("Neumonía bacteriana actualizada");
      expect(data.patient.attendingDoctor).toBe("Dr. Smith");
    });

    it("debería rechazar diagnosis vacía", async () => {
      const updateData = {
        diagnosis: "",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const params = Promise.resolve({ id: createdPatientId });
      const response = await PATCH_ID(request, { params });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/patients/:id", () => {
    beforeEach(async () => {
      const patient = await prisma.patient.create({
        data: {
          ...getValidPatientData(),
          hospital: hospitalName,
          dateOfBirth: new Date("1990-01-01"),
          admissionDate: new Date(),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería dar de alta (soft delete) un paciente", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        { method: "DELETE" }
      );

      const params = Promise.resolve({ id: createdPatientId });
      const response = await DELETE_ID(request, { params });
      const data = await response.json() as { success: boolean };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const updatedPatient = await prisma.patient.findUnique({
        where: { id: createdPatientId },
      });
      expect(updatedPatient?.isActive).toBe(false);
      createdPatientId = "";
    });

    it("debería devolver 404 para paciente no existente", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const request = new NextRequest(
        `http://localhost:3000/api/patients/${fakeId}`,
        { method: "DELETE" }
      );

      const params = Promise.resolve({ id: fakeId });
      const response = await DELETE_ID(request, { params });

      expect(response.status).toBe(404);
    });
  });
});
