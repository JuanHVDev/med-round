import { describe, it, expect, beforeEach, vi } from "vitest";
import { SoapService } from "@/services/soap/soapService";
import { ErrorCodes } from "@/lib/errors";
import type { CreateSoapNoteData } from "@/services/soap/types";
import type { PrismaClient } from "@prisma/client";

describe("SoapService", () => {
  let mockPrisma: {
    soapNote: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    patient: {
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  let service: SoapService;

  const validSoapNoteData: CreateSoapNoteData = {
    patientId: "123e4567-e89b-12d3-a456-426614174000",
    chiefComplaint: "Dolor torácico",
    historyOfPresentIllness: "Dolor opresivo en región precordial",
    vitalSigns: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 36.5,
      respiratoryRate: 16,
      oxygenSaturation: 98,
    },
    physicalExam: "Exploración física dentro de parámetros normales",
    laboratoryResults: "Biometría hemática normal",
    imagingResults: "Radiografía de tórax sin alteraciones",
    assessment: "Síndrome coronario agudo",
    plan: "Coronariografía urgente",
    medications: "Aspirina 100mg VO",
    pendingStudies: "Ecocardiograma",
  };

  const mockPatient = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    firstName: "Juan",
    lastName: "Pérez",
    hospital: "Hospital General",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma = {
      soapNote: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      patient: {
        findUnique: vi.fn(),
      },
    };
    service = new SoapService(mockPrisma as unknown as PrismaClient);
  });

  describe("creación de nota SOAP", () => {
    it("debería crear una nota SOAP con datos válidos", async () => {
      const mockNote = {
        id: "note-123",
        patientId: validSoapNoteData.patientId,
        chiefComplaint: validSoapNoteData.chiefComplaint,
        historyOfPresentIllness: validSoapNoteData.historyOfPresentIllness,
        vitalSigns: JSON.stringify(validSoapNoteData.vitalSigns),
        physicalExam: validSoapNoteData.physicalExam,
        laboratoryResults: validSoapNoteData.laboratoryResults,
        imagingResults: validSoapNoteData.imagingResults,
        assessment: validSoapNoteData.assessment,
        plan: validSoapNoteData.plan,
        medications: validSoapNoteData.medications,
        pendingStudies: validSoapNoteData.pendingStudies,
        date: new Date(),
        authorId: "author-123",
        hospital: "Hospital General",
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      mockPrisma.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrisma.soapNote.create.mockResolvedValue(mockNote);

      const result = await service.create(validSoapNoteData, "author-123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.note.id).toBe("note-123");
        expect(result.note.chiefComplaint).toBe(validSoapNoteData.chiefComplaint);
      }
    });

    it("debería rechazar nota sin campos requeridos", async () => {
      const invalidData = {
        patientId: "123e4567-e89b-12d3-a456-426614174000",
        chiefComplaint: "",
        historyOfPresentIllness: "Historia",
        physicalExam: "Examen",
        assessment: "Eval",
        plan: "Plan",
      } as CreateSoapNoteData;

      const result = await service.create(invalidData, "author-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });

    it("debería rechazar paciente inexistente", async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      const result = await service.create(validSoapNoteData, "author-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.PATIENT_NOT_FOUND);
      }
    });

    it("debería rechazar patientId inválido", async () => {
      const invalidData = {
        ...validSoapNoteData,
        patientId: "id-invalido",
      };

      const result = await service.create(invalidData, "author-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });
  });

  describe("obtener nota por ID", () => {
    it("debería obtener nota existente", async () => {
      const mockNote = {
        id: "note-123",
        patientId: validSoapNoteData.patientId,
        chiefComplaint: validSoapNoteData.chiefComplaint,
        historyOfPresentIllness: validSoapNoteData.historyOfPresentIllness,
        vitalSigns: JSON.stringify(validSoapNoteData.vitalSigns),
        physicalExam: validSoapNoteData.physicalExam,
        laboratoryResults: validSoapNoteData.laboratoryResults,
        imagingResults: validSoapNoteData.imagingResults,
        assessment: validSoapNoteData.assessment,
        plan: validSoapNoteData.plan,
        medications: validSoapNoteData.medications,
        pendingStudies: validSoapNoteData.pendingStudies,
        date: new Date(),
        authorId: "author-123",
        hospital: "Hospital General",
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      mockPrisma.soapNote.findUnique.mockResolvedValue(mockNote);

      const result = await service.getById("note-123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.note.id).toBe("note-123");
      }
    });

    it("debería retornar error si nota no existe", async () => {
      mockPrisma.soapNote.findUnique.mockResolvedValue(null);

      const result = await service.getById("note-inexistente");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.PATIENT_NOT_FOUND);
      }
    });
  });

  describe("listar notas", () => {
    it("debería listar notas con filtros", async () => {
      const mockNotes = [
        {
          id: "note-1",
          patientId: validSoapNoteData.patientId,
          chiefComplaint: validSoapNoteData.chiefComplaint,
          historyOfPresentIllness: validSoapNoteData.historyOfPresentIllness,
          vitalSigns: JSON.stringify(validSoapNoteData.vitalSigns),
          physicalExam: validSoapNoteData.physicalExam,
          laboratoryResults: validSoapNoteData.laboratoryResults,
          imagingResults: validSoapNoteData.imagingResults,
          assessment: validSoapNoteData.assessment,
          plan: validSoapNoteData.plan,
          medications: validSoapNoteData.medications,
          pendingStudies: validSoapNoteData.pendingStudies,
          date: new Date(),
          authorId: "author-123",
          hospital: "Hospital General",
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: mockPatient,
        },
      ];

      mockPrisma.soapNote.findMany.mockResolvedValue(mockNotes);
      mockPrisma.soapNote.count.mockResolvedValue(1);

      const result = await service.list({
        hospital: "Hospital General",
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.notes.length).toBe(1);
        expect(result.total).toBe(1);
      }
    });

    it("debería filtrar por paciente", async () => {
      const mockNotes = [
        {
          id: "note-1",
          patientId: validSoapNoteData.patientId,
          chiefComplaint: validSoapNoteData.chiefComplaint,
          historyOfPresentIllness: validSoapNoteData.historyOfPresentIllness,
          vitalSigns: JSON.stringify(validSoapNoteData.vitalSigns),
          physicalExam: validSoapNoteData.physicalExam,
          laboratoryResults: validSoapNoteData.laboratoryResults,
          imagingResults: validSoapNoteData.imagingResults,
          assessment: validSoapNoteData.assessment,
          plan: validSoapNoteData.plan,
          medications: validSoapNoteData.medications,
          pendingStudies: validSoapNoteData.pendingStudies,
          date: new Date(),
          authorId: "author-123",
          hospital: "Hospital General",
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: mockPatient,
        },
      ];

      mockPrisma.soapNote.findMany.mockResolvedValue(mockNotes);
      mockPrisma.soapNote.count.mockResolvedValue(1);

      const result = await service.list({
        hospital: "Hospital General",
        patientId: "123e4567-e89b-12d3-a456-426614174000",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("actualizar nota", () => {
    it("debería actualizar nota existente", async () => {
      const existingNote = {
        id: "note-123",
        patientId: validSoapNoteData.patientId,
        chiefComplaint: validSoapNoteData.chiefComplaint,
        historyOfPresentIllness: validSoapNoteData.historyOfPresentIllness,
        vitalSigns: JSON.stringify(validSoapNoteData.vitalSigns),
        physicalExam: validSoapNoteData.physicalExam,
        laboratoryResults: validSoapNoteData.laboratoryResults,
        imagingResults: validSoapNoteData.imagingResults,
        assessment: validSoapNoteData.assessment,
        plan: validSoapNoteData.plan,
        medications: validSoapNoteData.medications,
        pendingStudies: validSoapNoteData.pendingStudies,
        date: new Date(),
        authorId: "author-123",
        hospital: "Hospital General",
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: mockPatient,
      };

      const updatedNote = {
        ...existingNote,
        chiefComplaint: "Dolor torácico actualizado",
      };

      mockPrisma.soapNote.findUnique.mockResolvedValue(existingNote);
      mockPrisma.soapNote.update.mockResolvedValue(updatedNote);

      const result = await service.update("note-123", {
        chiefComplaint: "Dolor torácico actualizado",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.note.chiefComplaint).toBe("Dolor torácico actualizado");
      }
    });

    it("debería rechazar actualización de nota inexistente", async () => {
      mockPrisma.soapNote.findUnique.mockResolvedValue(null);

      const result = await service.update("note-inexistente", {
        chiefComplaint: "Actualización",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.PATIENT_NOT_FOUND);
      }
    });
  });

  describe("eliminar nota", () => {
    it("debería eliminar nota existente", async () => {
      mockPrisma.soapNote.findUnique.mockResolvedValue({
        id: "note-123",
      });
      mockPrisma.soapNote.delete.mockResolvedValue({ id: "note-123" });

      const result = await service.delete("note-123");

      expect(result.success).toBe(true);
    });

    it("debería rechazar eliminación de nota inexistente", async () => {
      mockPrisma.soapNote.findUnique.mockResolvedValue(null);

      const result = await service.delete("note-inexistente");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.PATIENT_NOT_FOUND);
      }
    });
  });

  describe("obtener notas por paciente", () => {
    it("debería obtener todas las notas de un paciente", async () => {
      const mockNotes = [
        {
          id: "note-1",
          patientId: validSoapNoteData.patientId,
          chiefComplaint: validSoapNoteData.chiefComplaint,
          historyOfPresentIllness: validSoapNoteData.historyOfPresentIllness,
          vitalSigns: JSON.stringify(validSoapNoteData.vitalSigns),
          physicalExam: validSoapNoteData.physicalExam,
          laboratoryResults: validSoapNoteData.laboratoryResults,
          imagingResults: validSoapNoteData.imagingResults,
          assessment: validSoapNoteData.assessment,
          plan: validSoapNoteData.plan,
          medications: validSoapNoteData.medications,
          pendingStudies: validSoapNoteData.pendingStudies,
          date: new Date(),
          authorId: "author-123",
          hospital: "Hospital General",
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: mockPatient,
        },
      ];

      mockPrisma.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrisma.soapNote.findMany.mockResolvedValue(mockNotes);

      const result = await service.getByPatient(
        "123e4567-e89b-12d3-a456-426614174000",
        "Hospital General"
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.notes.length).toBe(1);
        expect(result.total).toBe(1);
      }
    });

    it("debería rechazar si paciente no existe", async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      const result = await service.getByPatient(
        "paciente-inexistente",
        "Hospital General"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ErrorCodes.PATIENT_NOT_FOUND);
      }
    });
  });
});
