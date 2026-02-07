import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "@/app/api/soap-notes/route";
import { GET as GET_ID, PATCH as PATCH_ID, DELETE as DELETE_ID } from "@/app/api/soap-notes/[id]/route";
import { GET as GET_PATIENT_NOTES } from "@/app/api/soap-notes/[id]/patient-notes/route";
import { prisma } from "@/lib/prisma";
import type { CreateSoapNoteData, VitalSigns } from "@/services/soap/types";

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

describe("API SOAP Notes - Integración", () => {
  let patientId: string;
  let createdNoteId: string;
  const hospitalName = `Hospital Test ${Date.now()}`;

  const getValidVitalSigns = (): VitalSigns => ({
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 36.5,
    respiratoryRate: 16,
    oxygenSaturation: 98,
    weight: 70,
    height: 170,
  });

  const getValidSoapNoteData = (): CreateSoapNoteData => ({
    patientId,
    chiefComplaint: "Dolor torácico progresivo",
    historyOfPresentIllness: "Paciente refiere dolor torácico de 3 días de evolución",
    vitalSigns: getValidVitalSigns(),
    physicalExam: "Paciente alerta, orientado, mucosas rosadas",
    laboratoryResults: "Biometría hemática normal",
    imagingResults: "Rx tórax: campos pulmonares limpios",
    assessment: "Dolor torácico inespecífico",
    plan: "Analgesia PRN, seguimiento",
    medications: "Paracetamol 1g c/8h",
    pendingStudies: "EKG de control",
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

    const patient = await prisma.patient.create({
      data: {
        medicalRecordNumber: `HC-SOAP-${Date.now()}`,
        firstName: "María",
        lastName: "García",
        dateOfBirth: new Date("1985-05-15"),
        gender: "F",
        admissionDate: new Date(),
        bedNumber: "205A",
        roomNumber: "205",
        service: "Cardiología",
        diagnosis: "Valoración preoperatoria",
        allergies: "Ninguna",
        hospital: hospitalName,
        attendingDoctor: "Dr. Test",
        isActive: true,
      },
    });
    patientId = patient.id;
  });

  afterEach(async () => {
    if (createdNoteId) {
      await prisma.soapNote.deleteMany({
        where: { id: createdNoteId },
      }).catch(() => {});
    }
    await prisma.patient.deleteMany({
      where: { hospital: hospitalName },
    }).catch(() => {});
  });

  describe("POST /api/soap-notes", () => {
    it("debería crear una nota SOAP con datos válidos", async () => {
      const request = new NextRequest("http://localhost:3000/api/soap-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValidSoapNoteData()),
      });

      const response = await POST(request);
      const data = await response.json() as { note: { id: string; chiefComplaint: string } };

      expect(response.status).toBe(201);
      expect(data.note).toBeDefined();
      expect(data.note.chiefComplaint).toBe("Dolor torácico progresivo");
      createdNoteId = data.note.id;
    });

    it("debería rechazar datos inválidos", async () => {
      const invalidData = {
        patientId,
        chiefComplaint: "",
        historyOfPresentIllness: "",
        physicalExam: "",
        assessment: "",
        plan: "",
      };

      const request = new NextRequest("http://localhost:3000/api/soap-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json() as { error: { code: string } };

      expect(response.status).toBe(400);
      expect(data.error.code).toBe("VALIDATION_ERROR");
    });

    it("debería rechazar patientId inválido", async () => {
      const invalidData = {
        ...getValidSoapNoteData(),
        patientId: "invalid-uuid",
      };

      const request = new NextRequest("http://localhost:3000/api/soap-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("debería rechazar paciente no existente", async () => {
      const invalidData = {
        ...getValidSoapNoteData(),
        patientId: "00000000-0000-0000-0000-000000000000",
      };

      const request = new NextRequest("http://localhost:3000/api/soap-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json() as { error: { code: string } };

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("PATIENT_NOT_FOUND");
    });

    it("debería requerir autenticación", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost:3000/api/soap-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getValidSoapNoteData()),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/soap-notes", () => {
    beforeEach(async () => {
      const vitalSigns = getValidVitalSigns();
      const note = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint: "Dolor torácico progresivo",
          historyOfPresentIllness: "Paciente refiere dolor torácico de 3 días de evolución",
          vitalSigns: vitalSigns as Record<string, unknown>,
          physicalExam: "Paciente alerta, orientado, mucosas rosadas",
          laboratoryResults: "Biometría hemática normal",
          imagingResults: "Rx tórax: campos pulmonares limpios",
          assessment: "Dolor torácico inespecífico",
          plan: "Analgesia PRN, seguimiento",
          medications: "Paracetamol 1g c/8h",
          pendingStudies: "EKG de control",
          hospital: hospitalName,
          authorId: "test-user-123",
          date: new Date(),
        },
      });
      createdNoteId = note.id;
    });

    it("debería listar notas SOAP del hospital", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes?hospital=${encodeURIComponent(hospitalName)}`
      );

      const response = await GET(request);
      const data = await response.json() as { notes: unknown[]; total: number };

      expect(response.status).toBe(200);
      expect(data.notes).toBeDefined();
      expect(Array.isArray(data.notes)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(1);
    });

    it("debería filtrar por paciente", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes?patientId=${patientId}&hospital=${encodeURIComponent(hospitalName)}`
      );

      const response = await GET(request);
      const data = await response.json() as { notes: unknown[] };

      expect(response.status).toBe(200);
      expect(data.notes.length).toBeGreaterThanOrEqual(1);
      expect((data.notes[0] as { patientId: string }).patientId).toBe(patientId);
    });
  });

  describe("GET /api/soap-notes/:id", () => {
    beforeEach(async () => {
      const vitalSigns = getValidVitalSigns();
      const note = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint: "Dolor torácico progresivo",
          historyOfPresentIllness: "Paciente refiere dolor torácico de 3 días de evolución",
          vitalSigns: vitalSigns as Record<string, unknown>,
          physicalExam: "Paciente alerta, orientado, mucosas rosadas",
          laboratoryResults: "Biometría hemática normal",
          imagingResults: "Rx tórax: campos pulmonares limpios",
          assessment: "Dolor torácico inespecífico",
          plan: "Analgesia PRN, seguimiento",
          medications: "Paracetamol 1g c/8h",
          pendingStudies: "EKG de control",
          hospital: hospitalName,
          authorId: "test-user-123",
          date: new Date(),
        },
      });
      createdNoteId = note.id;
    });

    it("debería obtener una nota SOAP por ID", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes/${createdNoteId}`
      );

      const params = Promise.resolve({ id: createdNoteId });
      const response = await GET_ID(request, { params });
      const data = await response.json() as { note: { id: string; chiefComplaint: string } };

      expect(response.status).toBe(200);
      expect(data.note).toBeDefined();
      expect(data.note.id).toBe(createdNoteId);
    });

    it("debería devolver 404 para nota no existente", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const request = new NextRequest(`http://localhost:3000/api/soap-notes/${fakeId}`);

      const params = Promise.resolve({ id: fakeId });
      const response = await GET_ID(request, { params });
      const data = await response.json() as { error: { code: string } };

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("SOAP_NOTE_NOT_FOUND");
    });
  });

  describe("PATCH /api/soap-notes/:id", () => {
    beforeEach(async () => {
      const vitalSigns = getValidVitalSigns();
      const note = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint: "Dolor torácico progresivo",
          historyOfPresentIllness: "Paciente refiere dolor torácico de 3 días de evolución",
          vitalSigns: vitalSigns as Record<string, unknown>,
          physicalExam: "Paciente alerta, orientado, mucosas rosadas",
          laboratoryResults: "Biometría hemática normal",
          imagingResults: "Rx tórax: campos pulmonares limpios",
          assessment: "Dolor torácico inespecífico",
          plan: "Analgesia PRN, seguimiento",
          medications: "Paracetamol 1g c/8h",
          pendingStudies: "EKG de control",
          hospital: hospitalName,
          authorId: "test-user-123",
          date: new Date(),
        },
      });
      createdNoteId = note.id;
    });

    it("debería actualizar una nota SOAP", async () => {
      const updateData = {
        chiefComplaint: "Dolor torácico actualizado",
        assessment: "Evaluación actualizada",
      };

      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes/${createdNoteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const params = Promise.resolve({ id: createdNoteId });
      const response = await PATCH_ID(request, { params });
      const data = await response.json() as { note: { chiefComplaint: string; assessment: string } };

      expect(response.status).toBe(200);
      expect(data.note.chiefComplaint).toBe("Dolor torácico actualizado");
      expect(data.note.assessment).toBe("Evaluación actualizada");
    });

    it("debería actualizar signos vitales", async () => {
      const updateData = {
        vitalSigns: {
          bloodPressure: "140/90",
          heartRate: 85,
        },
      };

      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes/${createdNoteId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const params = Promise.resolve({ id: createdNoteId });
      const response = await PATCH_ID(request, { params });
      const data = await response.json() as { note: { vitalSigns: Record<string, unknown> } };

      expect(response.status).toBe(200);
      expect(data.note.vitalSigns).toHaveProperty("bloodPressure", "140/90");
    });
  });

  describe("DELETE /api/soap-notes/:id", () => {
    beforeEach(async () => {
      const vitalSigns = getValidVitalSigns();
      const note = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint: "Dolor torácico progresivo",
          historyOfPresentIllness: "Paciente refiere dolor torácico de 3 días de evolución",
          vitalSigns: vitalSigns as Record<string, unknown>,
          physicalExam: "Paciente alerta, orientado, mucosas rosadas",
          laboratoryResults: "Biometría hemática normal",
          imagingResults: "Rx tórax: campos pulmonares limpios",
          assessment: "Dolor torácico inespecífico",
          plan: "Analgesia PRN, seguimiento",
          medications: "Paracetamol 1g c/8h",
          pendingStudies: "EKG de control",
          hospital: hospitalName,
          authorId: "test-user-123",
          date: new Date(),
        },
      });
      createdNoteId = note.id;
    });

    it("debería eliminar una nota SOAP", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes/${createdNoteId}`,
        { method: "DELETE" }
      );

      const params = Promise.resolve({ id: createdNoteId });
      const response = await DELETE_ID(request, { params });
      const data = await response.json() as { success: boolean };

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      createdNoteId = "";
    });

    it("debería devolver 404 para nota no existente", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes/${fakeId}`,
        { method: "DELETE" }
      );

      const params = Promise.resolve({ id: fakeId });
      const response = await DELETE_ID(request, { params });
      const data = await response.json() as { error: { code: string } };

      expect(response.status).toBe(404);
      expect(data.error.code).toBe("SOAP_NOTE_NOT_FOUND");
    });
  });

  describe("GET /api/soap-notes/:id/patient-notes", () => {
    beforeEach(async () => {
      const vitalSigns = getValidVitalSigns();
      const note = await prisma.soapNote.create({
        data: {
          patientId,
          chiefComplaint: "Dolor torácico progresivo",
          historyOfPresentIllness: "Paciente refiere dolor torácico de 3 días de evolución",
          vitalSigns: vitalSigns as Record<string, unknown>,
          physicalExam: "Paciente alerta, orientado, mucosas rosadas",
          laboratoryResults: "Biometría hemática normal",
          imagingResults: "Rx tórax: campos pulmonares limpios",
          assessment: "Dolor torácico inespecífico",
          plan: "Analgesia PRN, seguimiento",
          medications: "Paracetamol 1g c/8h",
          pendingStudies: "EKG de control",
          hospital: hospitalName,
          authorId: "test-user-123",
          date: new Date(),
        },
      });
      createdNoteId = note.id;
    });

    it("debería obtener todas las notas de un paciente", async () => {
      const request = new NextRequest(
        `http://localhost:3000/api/soap-notes/${patientId}/patient-notes?hospital=${encodeURIComponent(hospitalName)}`
      );

      const params = Promise.resolve({ id: patientId });
      const response = await GET_PATIENT_NOTES(request, { params });
      const data = await response.json() as { notes: unknown[] };

      expect(response.status).toBe(200);
      expect(Array.isArray(data.notes)).toBe(true);
      expect(data.notes.length).toBeGreaterThanOrEqual(1);
    });
  });
});
