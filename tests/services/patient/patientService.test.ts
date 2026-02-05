import { describe, it, expect, vi, beforeEach } from "vitest";
import { PatientService } from "@/services/patient/patientService";
import { ErrorCodes } from "@/lib/errors";
import type { CreatePatientData, UpdatePatientData } from "@/services/patient/types";
import type { PrismaClient } from "@prisma/client";

/**
 * Tests unitarios para PatientService
 * 
 * Estos tests verifican:
 * - Creación de paciente con datos válidos
 * - Validación de medicalRecordNumber único
 * - Obtención de paciente por ID
 * - Listado de pacientes con filtros
 * - Actualización de paciente
 * - Soft delete (dar de alta)
 * - Búsqueda por cama/hospital
 * - Manejo de errores
 */
describe("PatientService", () => {
  // Mocks de Prisma
  const mockPrisma = {
    patient: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
  } as unknown as PrismaClient;

  let service: PatientService;

  // Datos válidos para crear paciente
  const validPatientData: CreatePatientData = {
    medicalRecordNumber: "HC-2024-001",
    firstName: "Juan",
    lastName: "Pérez García",
    dateOfBirth: "1985-03-15",
    gender: "M",
    bedNumber: "101A",
    roomNumber: "101",
    service: "Medicina Interna",
    diagnosis: "Neumonía adquirida en la comunidad",
    allergies: "Penicilina",
    hospital: "Hospital General",
    attendingDoctor: "Dr. María Rodríguez",
    bloodType: "O+",
    emergencyContactName: "Ana Pérez",
    emergencyContactPhone: "+52 55 1234 5678",
    insuranceProvider: "IMSS",
    insuranceNumber: "12345678901",
    weight: 75.5,
    height: 1.75,
    specialNotes: "Diabético tipo 2, hipertenso",
    dietType: "Diabética",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PatientService(mockPrisma);
  });

  describe("creación de paciente", () => {
    it("debería crear un paciente con datos válidos", async () => {
      // Arrange
      const mockPatient = {
        id: "patient-123",
        ...validPatientData,
        dateOfBirth: new Date(validPatientData.dateOfBirth),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.patient.create.mockResolvedValue(mockPatient);

      // Act
      const result = await service.create(validPatientData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.patient.id).toBe("patient-123");
        expect(result.patient.firstName).toBe(validPatientData.firstName);
      }
    });

    it("debería rechazar paciente sin campos requeridos", async () => {
      // Arrange
      const invalidData = {
        firstName: "Juan",
        // Falta medicalRecordNumber, lastName, etc.
      } as CreatePatientData;

      // Act
      const result = await service.create(invalidData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
      }
    });

    it("debería rechazar medicalRecordNumber duplicado", async () => {
      // Arrange
      const dbError = new Error("Unique constraint failed");
      (dbError as Error & { code?: string }).code = "P2002";
      mockPrisma.patient.create.mockRejectedValue(dbError);

      // Act
      const result = await service.create(validPatientData);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.DUPLICATE_ERROR);
      }
    });

    it("debería convertir dateOfBirth string a Date", async () => {
      // Arrange
      let capturedArgs: { data: { dateOfBirth: Date } } | null = null;
      mockPrisma.patient.create.mockImplementation((args) => {
        capturedArgs = args as { data: { dateOfBirth: Date } };
        return Promise.resolve({
          id: "patient-123",
          ...args.data,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Act
      await service.create(validPatientData);

      // Assert
      expect(mockPrisma.patient.create).toHaveBeenCalled();
      expect(capturedArgs?.data.dateOfBirth).toBeInstanceOf(Date);
    });
  });

  describe("obtención de paciente", () => {
    it("debería obtener paciente por ID", async () => {
      // Arrange
      const mockPatient = {
        id: "patient-123",
        medicalRecordNumber: "HC-2024-001",
        firstName: "Juan",
        lastName: "Pérez",
        isActive: true,
      };
      mockPrisma.patient.findUnique.mockResolvedValue(mockPatient);

      // Act
      const result = await service.getById("patient-123");

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.patient.id).toBe("patient-123");
      }
    });

    it("debería retornar error si paciente no existe", async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.getById("non-existent");

      // Assert
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.PATIENT_NOT_FOUND);
      }
    });

    it("debería obtener paciente con notas SOAP y tareas", async () => {
      // Arrange
      const mockPatient = {
        id: "patient-123",
        firstName: "Juan",
        soapNotes: [{ id: "note-1", chiefComplaint: "Test" }],
        tasks: [{ id: "task-1", title: "Tarea 1" }],
      };
      mockPrisma.patient.findUnique.mockResolvedValue(mockPatient);

      // Act
      const result = await service.getByIdWithRelations("patient-123");

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.patient.soapNotes).toHaveLength(1);
        expect(result.patient.tasks).toHaveLength(1);
      }
    });
  });

  describe("listado de pacientes", () => {
    it("debería listar pacientes activos por hospital", async () => {
      // Arrange
      const mockPatients = [
        { id: "p1", firstName: "Juan", isActive: true },
        { id: "p2", firstName: "María", isActive: true },
      ];
      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);
      mockPrisma.patient.count.mockResolvedValue(2);

      // Act
      const result = await service.list({
        hospital: "Hospital General",
        isActive: true,
      });

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.patients).toHaveLength(2);
        expect(result.total).toBe(2);
      }
    });

    it("debería filtrar por servicio y cama", async () => {
      // Arrange
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(0);

      // Act
      await service.list({
        hospital: "Hospital General",
        service: "Medicina Interna",
        bedNumber: "101",
      });

      // Assert
      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hospital: "Hospital General",
            service: "Medicina Interna",
            bedNumber: { contains: "101" },
          }),
        })
      );
    });

    it("debería paginar resultados", async () => {
      // Arrange
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(100);

      // Act
      await service.list({
        hospital: "Hospital General",
        page: 2,
        limit: 10,
      });

      // Assert
      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (page - 1) * limit
          take: 10,
        })
      );
    });
  });

  describe("actualización de paciente", () => {
    it("debería actualizar datos del paciente", async () => {
      // Arrange
      const updateData: UpdatePatientData = {
        firstName: "Juan Carlos",
        bedNumber: "102A",
      };
      const mockUpdated = {
        id: "patient-123",
        ...validPatientData,
        ...updateData,
        dateOfBirth: new Date(validPatientData.dateOfBirth),
      };
      mockPrisma.patient.update.mockResolvedValue(mockUpdated);

      // Act
      const result = await service.update("patient-123", updateData);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.patient.firstName).toBe("Juan Carlos");
        expect(result.patient.bedNumber).toBe("102A");
      }
    });

    it("debería rechazar actualización de medicalRecordNumber duplicado", async () => {
      // Arrange
      const dbError = new Error("Unique constraint failed");
      (dbError as Error & { code?: string }).code = "P2002";
      mockPrisma.patient.update.mockRejectedValue(dbError);

      // Act
      const result = await service.update("patient-123", {
        medicalRecordNumber: "HC-EXISTENTE",
      });

      // Assert
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.DUPLICATE_ERROR);
      }
    });
  });

  describe("soft delete (dar de alta)", () => {
    it("debería marcar paciente como inactivo (dar de alta)", async () => {
      // Arrange
      const mockUpdated = {
        id: "patient-123",
        isActive: false,
        dischargedAt: new Date(),
      };
      mockPrisma.patient.update.mockResolvedValue(mockUpdated);

      // Act
      const result = await service.discharge("patient-123");

      // Assert
      expect(result.success).toBe(true);
      expect(mockPrisma.patient.update).toHaveBeenCalledWith({
        where: { id: "patient-123" },
        data: {
          isActive: false,
          dischargedAt: expect.any(Date),
        },
      });
    });

    it("debería permitir reactivar paciente", async () => {
      // Arrange
      const mockUpdated = {
        id: "patient-123",
        isActive: true,
        dischargedAt: null,
      };
      mockPrisma.patient.update.mockResolvedValue(mockUpdated);

      // Act
      const result = await service.reactivate("patient-123");

      // Assert
      expect(result.success).toBe(true);
      expect(mockPrisma.patient.update).toHaveBeenCalledWith({
        where: { id: "patient-123" },
        data: {
          isActive: true,
          dischargedAt: null,
        },
      });
    });
  });

  describe("búsqueda", () => {
    it("debería buscar paciente por número de cama", async () => {
      // Arrange
      const mockPatient = {
        id: "patient-123",
        bedNumber: "101A",
        hospital: "Hospital General",
      };
      mockPrisma.patient.findFirst.mockResolvedValue(mockPatient);

      // Act
      const result = await service.findByBed("101A", "Hospital General");

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.patient.bedNumber).toBe("101A");
      }
    });
  });

  describe("manejo de errores", () => {
    it("debería manejar errores de base de datos", async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockRejectedValue(new Error("Connection timeout"));

      // Act
      const result = await service.getById("patient-123");

      // Assert
      expect(result.success).toBe(false);
      if (!result.success && result.error) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      }
    });

    it("debería retornar error estructurado en todos los casos", async () => {
      // Arrange
      mockPrisma.patient.findUnique.mockRejectedValue(new Error("Unknown error"));

      // Act
      const result = await service.getById("patient-123");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      if (result.error) {
        expect(result.error).toHaveProperty("code");
        expect(result.error).toHaveProperty("message");
      }
    });
  });
});
