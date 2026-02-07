import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Modelos de Prisma - Fase 2", () => {
  beforeEach(async () => {
    await prisma.$transaction([
      prisma.taskChecklistItem.deleteMany(),
      prisma.task.deleteMany(),
      prisma.soapNote.deleteMany(),
      prisma.patient.deleteMany(),
      prisma.medicosProfile.deleteMany(),
      prisma.user.deleteMany(),
    ]).catch(() => {});
  });

  describe("Patient Model", () => {
    const validPatientData = {
      medicalRecordNumber: `HC-${Date.now()}-001`,
      firstName: "Juan",
      lastName: "Pérez García",
      dateOfBirth: new Date("1985-03-15"),
      gender: "M",
      admissionDate: new Date(),
      bedNumber: "101A",
      roomNumber: "101",
      service: "Medicina Interna",
      diagnosis: "Neumonía adquirida en la comunidad",
      allergies: "Penicilina",
      hospital: "Hospital Test",
      attendingDoctor: "Dr. María Rodríguez",
      isActive: true,
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

    it("debería crear un paciente con datos válidos", async () => {
      const patient = await prisma.patient.create({
        data: validPatientData,
      });

      expect(patient.id).toBeDefined();
      expect(patient.medicalRecordNumber).toBe(validPatientData.medicalRecordNumber);
      expect(patient.firstName).toBe(validPatientData.firstName);
      expect(patient.isActive).toBe(true);
      expect(patient.createdAt).toBeInstanceOf(Date);
      expect(patient.updatedAt).toBeInstanceOf(Date);
    });

    it("debería rechazar creación sin campos requeridos", async () => {
      await expect(
        prisma.patient.create({ data: { firstName: "Juan" } as any })
      ).rejects.toThrow();
    });

    it("debería rechazar medicalRecordNumber duplicado", async () => {
      await prisma.patient.create({ data: validPatientData });

      const duplicateData = { ...validPatientData, medicalRecordNumber: `HC-${Date.now()}-dup` };
      await prisma.patient.create({ data: duplicateData });

      await expect(
        prisma.patient.create({ data: duplicateData })
      ).rejects.toThrow(/unique/i);
    });

    it("debería realizar soft delete actualizando isActive", async () => {
      const patient = await prisma.patient.create({
        data: validPatientData,
      });

      const deleted = await prisma.patient.delete({
        where: { id: patient.id },
      });

      expect(deleted.isActive).toBe(false);
    });
  });

  describe("SoapNote Model", () => {
    const hospitalName = `Hospital Test ${Date.now()}`;
    let patientId: string;

    beforeEach(async () => {
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

    const validSoapNoteData = (pid: string) => ({
      patientId: pid,
      chiefComplaint: "Dolor torácico",
      historyOfPresentIllness: "Paciente con dolor torácico de 3 días",
      vitalSigns: {
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.5,
      },
      physicalExam: "Exploración física normal",
      assessment: "Dolor torácico inespecífico",
      plan: "Analgesia según necesidad",
      hospital: hospitalName,
      authorId: "test-user-123",
      date: new Date(),
    });

    it("debería crear una nota SOAP con datos válidos", async () => {
      const note = await prisma.soapNote.create({
        data: validSoapNoteData(patientId),
      });

      expect(note.id).toBeDefined();
      expect(note.chiefComplaint).toBe(validSoapNoteData(patientId).chiefComplaint);
      expect(note.vitalSigns).toBeDefined();
    });
  });

  describe("Relaciones entre modelos", () => {
    it("debería incluir notas SOAP al consultar paciente", async () => {
      const patient = await prisma.patient.create({
        data: {
          medicalRecordNumber: `HC-REL-${Date.now()}`,
          firstName: "Pedro",
          lastName: "Rodríguez",
          dateOfBirth: new Date("1970-01-01"),
          gender: "M",
          admissionDate: new Date(),
          bedNumber: "301A",
          roomNumber: "301",
          service: "Cirugía",
          diagnosis: "Apendicitis",
          allergies: "Ninguna",
          hospital: "Hospital Test",
          attendingDoctor: "Dr. Test",
          isActive: true,
        },
      });

      await prisma.soapNote.create({
        data: {
          patientId: patient.id,
          chiefComplaint: "Dolor abdominal",
          historyOfPresentIllness: "Dolor abdominal de 24 horas",
          vitalSigns: { bloodPressure: "130/85", heartRate: 80 },
          physicalExam: "Abdomen con dolor",
          assessment: "Apendicitis aguda",
          plan: "Apéndicectomía",
          hospital: "Hospital Test",
          authorId: "test-user-123",
          date: new Date(),
        },
      });

      const found = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: { soapNotes: true },
      });

      expect(found).toBeDefined();
      expect(found?.soapNotes).toHaveLength(1);
      expect(found?.soapNotes[0].chiefComplaint).toBe("Dolor abdominal");
    });

    it("debería incluir tareas al consultar paciente", async () => {
      const patient = await prisma.patient.create({
        data: {
          medicalRecordNumber: `HC-TASK-${Date.now()}`,
          firstName: "Laura",
          lastName: "Fernández",
          dateOfBirth: new Date("1992-08-20"),
          gender: "F",
          admissionDate: new Date(),
          bedNumber: "102B",
          roomNumber: "102",
          service: "Urgencias",
          diagnosis: "Cefalea",
          allergies: "Ninguna",
          hospital: "Hospital Test",
          attendingDoctor: "Dr. Test",
          isActive: true,
        },
      });

      await prisma.task.create({
        data: {
          patientId: patient.id,
          title: "Tomar signos vitales",
          description: "Tomar signos vitales cada 4 horas",
          status: "PENDING",
          priority: "HIGH",
          type: "MEDICATION" as any,
          dueDate: new Date(),
          assignedTo: "Dr. Test",
          createdBy: "test-user-123",
          hospital: "Hospital Test",
        },
      });

      const found = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: { tasks: true },
      });

      expect(found).toBeDefined();
      expect(found?.tasks).toHaveLength(1);
      expect(found?.tasks[0].title).toBe("Tomar signos vitales");
    });
  });
});
