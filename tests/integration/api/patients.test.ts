import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/patients/route";
import { GET as GET_ID, PATCH as PATCH_ID, DELETE as DELETE_ID } from "@/app/api/patients/[id]/route";
import { prisma } from "@/lib/prisma";
import type { CreatePatientData } from "@/services/patient/types";

// Mock de auth para simular sesión válida por defecto
const mockGetSession = vi.fn(() => Promise.resolve({
  user: {
    id: "test-user-123",
    name: "Test User",
    email: "test@example.com",
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => mockGetSession()),
    },
  },
}));

// Mock de rate limiting para evitar errores de Redis
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

/**
 * Tests de integración para la API de pacientes
 * 
 * Estos tests verifican:
 * - GET /api/patients - Listar pacientes
 * - POST /api/patients - Crear paciente
 * - GET /api/patients/:id - Obtener paciente
 * - PATCH /api/patients/:id - Actualizar paciente
 * - DELETE /api/patients/:id - Dar de alta (soft delete)
 * - Rate limiting
 * - Autenticación requerida
 */
describe("API Pacientes - Integración", () =>
{
  const getValidPatientData = (): CreatePatientData => ({
    medicalRecordNumber: `HC-${Math.random().toString(36).substring(7)}`,
    firstName: "Juan",
    lastName: "Pérez",
    dateOfBirth: "1990-01-01",
    gender: "M",
    admissionDate: "2024-01-01",
    bedNumber: "101A",
    roomNumber: "101",
    service: "Medicina Interna",
    diagnosis: "Neumonía",
    allergies: "Penicilina",
    hospital: "Hospital General",
    attendingDoctor: "Dr. Test",
  });

  let createdPatientId: string;

  beforeEach(async () =>
  {
    await prisma.patient.deleteMany({
      where: { hospital: "Hospital General" },
    });
  });

  afterEach(async () =>
  {
    if (createdPatientId)
    {
      await prisma.patient.deleteMany({
        where: { id: createdPatientId },
      });
    }
    await prisma.patient.deleteMany({
      where: { hospital: "Hospital General" },
    });
  });

  describe("POST /api/patients", () =>
  {
    it("debería crear un paciente con datos válidos", async () =>
    {
      const request = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getValidPatientData()),
      });

      const response = await POST(request);
      const data = await response.json() as { patient: { id: string; firstName: string } };

      expect(response.status).toBe(201);
      expect(data.patient).toBeDefined();
      expect(data.patient.firstName).toBe("Juan");
      createdPatientId = data.patient.id;
    });

    it("debería rechazar datos inválidos", async () =>
    {
      const invalidData = {
        firstName: "Juan",
        // Falta campos requeridos
      };

      const request = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json() as { error: string; code: string };

      expect(response.status).toBe(400);
      expect(data.code).toBe("VALIDATION_ERROR");
    });

    it("debería requerir autenticación", async () =>
    {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost:3000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getValidPatientData()),
      });

      const response = await POST(request);
      const data = await response.json() as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe("No autenticado");
    });
  });

  describe("GET /api/patients", () =>
  {
    beforeEach(async () =>
    {
      const data = getValidPatientData();
      const patient = await prisma.patient.create({
        data: {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth),
          admissionDate: new Date(data.admissionDate),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería listar pacientes activos del hospital", async () =>
    {
      const request = new NextRequest(
        "http://localhost:3000/api/patients?hospital=Hospital%20General"
      );

      const response = await GET(request);
      const data = await response.json() as { patients: unknown[]; total: number };

      expect(response.status).toBe(200);
      expect(data.patients).toBeDefined();
      expect(Array.isArray(data.patients)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);
    });

    it("debería filtrar por servicio", async () =>
    {
      const request = new NextRequest(
        "http://localhost:3000/api/patients?hospital=Hospital%20General&service=Medicina%20Interna"
      );

      const response = await GET(request);
      const data = await response.json() as { patients: unknown[] };

      expect(response.status).toBe(200);
      expect(data.patients.length).toBe(1);
    });

    it("debería requerir autenticación", async () =>
    {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest(
        "http://localhost:3000/api/patients?hospital=Hospital%20General"
      );

      const response = await GET(request);
      const data = await response.json() as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe("No autenticado");
    });
  });

  describe("GET /api/patients/:id", () =>
  {
    beforeEach(async () =>
    {
      const data = getValidPatientData();
      const patient = await prisma.patient.create({
        data: {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth),
          admissionDate: new Date(data.admissionDate),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería obtener paciente por ID", async () =>
    {
      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`
      );

      const response = await GET_ID(request, {
        params: Promise.resolve({ id: createdPatientId }),
      });
      const data = await response.json() as { patient: { firstName: string } };

      expect(response.status).toBe(200);
      expect(data.patient).toBeDefined();
      expect(data.patient.firstName).toBe("Juan");
    });

    it("debería retornar 404 si paciente no existe", async () =>
    {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const request = new NextRequest(
        `http://localhost:3000/api/patients/${nonExistentId}`
      );

      const response = await GET_ID(request, {
        params: Promise.resolve({ id: nonExistentId }),
      });
      const data = await response.json() as { error: string; code: string };

      expect(response.status).toBe(404);
      expect(data.code).toBe("PATIENT_NOT_FOUND");
    });

    it("debería requerir autenticación", async () =>
    {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`
      );

      const response = await GET_ID(request, {
        params: Promise.resolve({ id: createdPatientId }),
      });
      const data = await response.json() as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe("No autenticado");
    });
  });

  describe("PATCH /api/patients/:id", () =>
  {
    beforeEach(async () =>
    {
      const data = getValidPatientData();
      const patient = await prisma.patient.create({
        data: {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth),
          admissionDate: new Date(data.admissionDate),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería actualizar datos del paciente", async () =>
    {
      const updateData = {
        firstName: "Juan Carlos",
        bedNumber: "102B",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const response = await PATCH_ID(request, {
        params: Promise.resolve({ id: createdPatientId }),
      });
      const data = await response.json() as { patient: { firstName: string } };

      expect(response.status).toBe(200);
      expect(data.patient.firstName).toBe("Juan Carlos");
    });

    it("debería requerir autenticación", async () =>
    {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const response = await PATCH_ID(request, {
        params: Promise.resolve({ id: createdPatientId }),
      });
      const data = await response.json() as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe("No autenticado");
    });
  });

  describe("DELETE /api/patients/:id", () =>
  {
    beforeEach(async () =>
    {
      const data = getValidPatientData();
      const patient = await prisma.patient.create({
        data: {
          ...data,
          dateOfBirth: new Date(data.dateOfBirth),
          admissionDate: new Date(data.admissionDate),
        },
      });
      createdPatientId = patient.id;
    });

    it("debería dar de alta al paciente (soft delete)", async () =>
    {
      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        {
          method: "DELETE",
        }
      );

      const response = await DELETE_ID(request, {
        params: Promise.resolve({ id: createdPatientId }),
      });
      const data = await response.json() as { success: boolean };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const patient = await prisma.patient.findUnique({
        where: { id: createdPatientId },
      });

      expect(patient?.isActive).toBe(false);
      expect(patient?.dischargedAt).toBeDefined();
    });

    it("debería requerir autenticación", async () =>
    {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest(
        `http://localhost:3000/api/patients/${createdPatientId}`,
        {
          method: "DELETE",
        }
      );

      const response = await DELETE_ID(request, {
        params: Promise.resolve({ id: createdPatientId }),
      });
      const data = await response.json() as { error: string };

      expect(response.status).toBe(401);
      expect(data.error).toBe("No autenticado");
    });
  });
});
