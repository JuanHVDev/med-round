import { describe, it, expect, beforeEach } from "vitest";
import { testPrisma as prisma } from "@/lib/prisma-test";

/**
 * Tests de modelo Prisma - Patient, SoapNote, Task, TaskChecklistItem
 * 
 * Estos tests verifican:
 * - Creación de registros con datos válidos
 * - Validaciones de constraints (unique, required)
 * - Relaciones entre modelos (1:N, N:M)
 * - Soft delete en Patient
 * - Índices de búsqueda
 * 
 * Nota: Estos tests usan la base de datos de test (SQLite)
 * y se ejecutan en paralelo con otros tests de integración.
 */
describe("Modelos de Prisma - Fase 2", () => {
  // Helper para convertir objeto a JSON string (para SQLite)
  const toJsonString = (obj: unknown): string => JSON.stringify(obj);

  beforeEach(async () => {
    // Limpiar en orden inverso por dependencias
    await prisma.$transaction([
      prisma.taskChecklistItem.deleteMany(),
      prisma.task.deleteMany(),
      prisma.soapNote.deleteMany(),
      prisma.patient.deleteMany(),
      prisma.medicosProfile.deleteMany(),
      prisma.user.deleteMany(),
    ]).catch(() => {
      // Ignorar si las tablas no existen aún
    });
  });

  describe("Patient Model", () => {
    const validPatientData = {
      medicalRecordNumber: "HC-2024-001",
      firstName: "Juan",
      lastName: "Pérez García",
      dateOfBirth: new Date("1985-03-15"),
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
      isolationPrecautions: null,
    };

    it("debería crear un paciente con datos válidos", async () => {
      // Act
      const patient = await prisma.patient.create({
        data: validPatientData,
      });

      // Assert
      expect(patient.id).toBeDefined();
      expect(patient.medicalRecordNumber).toBe(validPatientData.medicalRecordNumber);
      expect(patient.firstName).toBe(validPatientData.firstName);
      expect(patient.isActive).toBe(true);
      expect(patient.createdAt).toBeInstanceOf(Date);
      expect(patient.updatedAt).toBeInstanceOf(Date);
    });

    it("debería rechazar creación sin campos requeridos", async () => {
      // Arrange
      const invalidData = {
        firstName: "Juan",
        // Falta medicalRecordNumber, lastName, dateOfBirth, etc.
      };

      // Act & Assert
      await expect(
        prisma.patient.create({ data: invalidData as { firstName: string } })
      ).rejects.toThrow();
    });

    it("debería rechazar medicalRecordNumber duplicado", async () => {
      // Arrange
      await prisma.patient.create({ data: validPatientData });

      // Act & Assert
      await expect(
        prisma.patient.create({ data: validPatientData })
      ).rejects.toThrow(/unique/i);
    });

    it("debería realizar soft delete actualizando isActive", async () => {
      // Arrange
      const patient = await prisma.patient.create({ data: validPatientData });

      // Act
      const updated = await prisma.patient.update({
        where: { id: patient.id },
        data: { isActive: false, dischargedAt: new Date() },
      });

      // Assert
      expect(updated.isActive).toBe(false);
      expect(updated.dischargedAt).toBeInstanceOf(Date);
    });

    it("debería buscar pacientes por hospital e isActive", async () => {
      // Arrange
      await prisma.patient.create({ data: validPatientData });
      await prisma.patient.create({
        data: { ...validPatientData, medicalRecordNumber: "HC-2024-002" },
      });

      // Act
      const activePatients = await prisma.patient.findMany({
        where: { hospital: "Hospital General", isActive: true },
      });

      // Assert
      expect(activePatients).toHaveLength(2);
    });

    it("debería buscar paciente por bedNumber y hospital", async () => {
      // Arrange
      await prisma.patient.create({ data: validPatientData });

      // Act
      const found = await prisma.patient.findFirst({
        where: { bedNumber: "101A", hospital: "Hospital General" },
      });

      // Assert
      expect(found).not.toBeNull();
      expect(found?.medicalRecordNumber).toBe(validPatientData.medicalRecordNumber);
    });

    it("debería incluir campos opcionales correctamente", async () => {
      // Arrange - paciente con mínimos campos
      const minimalData = {
        medicalRecordNumber: "HC-2024-003",
        firstName: "María",
        lastName: "López",
        dateOfBirth: new Date("1990-07-20"),
        gender: "F",
        bedNumber: "102B",
        service: "Cirugía",
        diagnosis: "Apendicitis",
        hospital: "Hospital General",
        attendingDoctor: "Dr. Carlos Ruiz",
      };

      // Act
      const patient = await prisma.patient.create({ data: minimalData });

      // Assert
      expect(patient.bloodType).toBeNull();
      expect(patient.emergencyContactName).toBeNull();
      expect(patient.allergies).toBeNull();
      expect(patient.roomNumber).toBeNull();
    });
  });

  describe("SoapNote Model", () => {
    let patientId: string;

    beforeEach(async () => {
      const patient = await prisma.patient.create({
        data: {
          medicalRecordNumber: "HC-SOAP-001",
          firstName: "Test",
          lastName: "Patient",
          dateOfBirth: new Date("1980-01-01"),
          gender: "M",
          bedNumber: "201",
          service: "Medicina",
          diagnosis: "Test",
          hospital: "Hospital Test",
          attendingDoctor: "Dr. Test",
        },
      });
      patientId = patient.id;
    });

    const validSoapNoteData = {
      patientId: "placeholder",
      chiefComplaint: "Dolor torácico de 2 horas de evolución",
      historyOfPresentIllness: "Paciente refiere dolor precordial opresivo...",
      vitalSigns: toJsonString({
        heartRate: 88,
        bloodPressure: "120/80",
        respiratoryRate: 18,
        temperature: 36.5,
        oxygenSaturation: 98,
      }),
      physicalExam: "Estado general: consciente, orientado...",
      laboratoryResults: "Hemoglobina 14.2 g/dL, Leucocitos 8,500",
      imagingResults: "Radiografía de tórax: sin infiltrados",
      assessment: "Dolor torácico atípico, descartar síndrome coronario agudo",
      plan: "1. ECG seriados\n2. Troponinas\n3. Oxigenoterapia",
      medications: "AAS 100mg VO cada 24h",
      pendingStudies: "Troponinas I a las 3h y 6h",
      authorId: "user-123",
      hospital: "Hospital General",
    };

    it("debería crear una nota SOAP con datos válidos", async () => {
      // Act
      const soapNote = await prisma.soapNote.create({
        data: { ...validSoapNoteData, patientId },
      });

      // Assert
      expect(soapNote.id).toBeDefined();
      expect(soapNote.patientId).toBe(patientId);
      expect(soapNote.chiefComplaint).toBe(validSoapNoteData.chiefComplaint);
      // En SQLite se almacena como string, verificamos que contiene los datos
      expect(soapNote.vitalSigns).toContain("heartRate");
      expect(soapNote.date).toBeInstanceOf(Date);
    });

    it("debería rechazar nota SOAP sin paciente", async () => {
      // Act & Assert
      await expect(
        prisma.soapNote.create({
          data: { ...validSoapNoteData, patientId: "non-existent-id" },
        })
      ).rejects.toThrow(/foreign/i);
    });

    it("debería eliminar notas SOAP al eliminar paciente (Cascade)", async () => {
      // Arrange
      await prisma.soapNote.create({
        data: { ...validSoapNoteData, patientId },
      });

      // Act
      await prisma.patient.delete({ where: { id: patientId } });

      // Assert
      const notes = await prisma.soapNote.findMany({ where: { patientId } });
      expect(notes).toHaveLength(0);
    });

    it("debería listar notas por paciente ordenadas por fecha", async () => {
      // Arrange
      await prisma.soapNote.create({
        data: { ...validSoapNoteData, patientId, date: new Date("2024-01-15") },
      });
      await prisma.soapNote.create({
        data: { ...validSoapNoteData, patientId, date: new Date("2024-01-16") },
      });

      // Act
      const notes = await prisma.soapNote.findMany({
        where: { patientId },
        orderBy: { date: "desc" },
      });

      // Assert
      expect(notes).toHaveLength(2);
      expect(new Date(notes[0].date) > new Date(notes[1].date)).toBe(true);
    });

    it("debería permitir campos opcionales vacíos", async () => {
      // Arrange
      const minimalSoapData = {
        patientId,
        chiefComplaint: "Control rutinario",
        historyOfPresentIllness: "Sin cambios",
        physicalExam: "Normal",
        assessment: "Estable",
        plan: "Continuar manejo",
        authorId: "user-123",
        hospital: "Hospital General",
      };

      // Act
      const note = await prisma.soapNote.create({ data: minimalSoapData });

      // Assert
      expect(note.vitalSigns).toBeNull();
      expect(note.laboratoryResults).toBeNull();
      expect(note.imagingResults).toBeNull();
      expect(note.medications).toBeNull();
      expect(note.pendingStudies).toBeNull();
    });
  });

  describe("Task Model", () => {
    let patientId: string;
    let medicosProfileId: string;

    beforeEach(async () => {
      // Crear un usuario y perfil médico primero (requerido por FK)
      const user = await prisma.user.create({
        data: {
          id: "user-test-" + Date.now(),
          email: `test-${Date.now()}@example.com`,
          name: "Dr. Test",
        },
      });

      const profile = await prisma.medicosProfile.create({
        data: {
          userId: user.id,
          fullName: "Dr. Test Profile",
          hospital: "Hospital General",
          specialty: "Medicina Interna",
          userType: "professional",
        },
      });
      medicosProfileId = profile.id;

      const patient = await prisma.patient.create({
        data: {
          medicalRecordNumber: "HC-TASK-" + Date.now(),
          firstName: "Task",
          lastName: "Patient",
          dateOfBirth: new Date("1980-01-01"),
          gender: "M",
          bedNumber: "301",
          service: "Medicina",
          diagnosis: "Test",
          hospital: "Hospital Test",
          attendingDoctor: "Dr. Test",
        },
      });
      patientId = patient.id;
    });

    const getValidTaskData = () => ({
      title: "Solicitar hemocultivos",
      description: "Tomar hemocultivos antes de iniciar antibióticos",
      status: "PENDING" as const,
      priority: "HIGH" as const,
      type: "LABORATORY" as const,
      patientId,
      assignedTo: medicosProfileId,
      createdBy: medicosProfileId,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      hospital: "Hospital General",
      service: "Medicina Interna",
      shift: "Mañana",
    });

    it("debería crear una tarea con datos válidos", async () => {
      // Act
      const task = await prisma.task.create({
        data: getValidTaskData(),
      });

      // Assert
      expect(task.id).toBeDefined();
      expect(task.title).toBe("Solicitar hemocultivos");
      expect(task.status).toBe("PENDING");
      expect(task.priority).toBe("HIGH");
      expect(task.type).toBe("LABORATORY");
      expect(task.patientId).toBe(patientId);
    });

    it("debería crear tarea sin paciente asociado", async () => {
      // Arrange
      const taskWithoutPatient = {
        ...getValidTaskData(),
        patientId: null,
      };

      // Act
      const task = await prisma.task.create({ data: taskWithoutPatient });

      // Assert
      expect(task.patientId).toBeNull();
    });

    it("debería actualizar estado a COMPLETED con fecha de completado", async () => {
      // Arrange
      const task = await prisma.task.create({ data: getValidTaskData() });

      // Act
      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      // Assert
      expect(updated.status).toBe("COMPLETED");
      expect(updated.completedAt).toBeInstanceOf(Date);
    });

    it("debería filtrar tareas por asignado y estado", async () => {
      // Arrange
      const taskData = getValidTaskData();
      await prisma.task.create({ data: taskData });
      await prisma.task.create({
        data: { ...taskData, title: "Otra tarea", status: "IN_PROGRESS" },
      });
      await prisma.task.create({
        data: { ...taskData, title: "Tarea diferente", assignedTo: medicosProfileId, createdBy: medicosProfileId },
      });

      // Act
      const myPendingTasks = await prisma.task.findMany({
        where: { assignedTo: medicosProfileId, status: { in: ["PENDING", "IN_PROGRESS"] } },
      });

      // Assert
      expect(myPendingTasks).toHaveLength(2);
    });

    it("debería establecer patientId a null al eliminar paciente", async () => {
      // Arrange
      const task = await prisma.task.create({ data: getValidTaskData() });

      // Act
      await prisma.patient.delete({ where: { id: patientId } });

      // Assert
      const updatedTask = await prisma.task.findUnique({ where: { id: task.id } });
      expect(updatedTask?.patientId).toBeNull();
    });

    it("debería rechazar tarea sin título", async () => {
      // Act & Assert
      await expect(
        prisma.task.create({
          data: { ...getValidTaskData(), title: "" },
        })
      ).rejects.toThrow();
    });
  });

  describe("TaskChecklistItem Model", () => {
    let taskId: string;
    let medicosProfileId: string;

    beforeEach(async () => {
      // Crear un usuario y perfil médico primero
      const user = await prisma.user.create({
        data: {
          id: "user-checklist-" + Date.now(),
          email: `checklist-${Date.now()}@example.com`,
          name: "Dr. Checklist",
        },
      });

      const profile = await prisma.medicosProfile.create({
        data: {
          userId: user.id,
          fullName: "Dr. Checklist Profile",
          hospital: "Hospital General",
          specialty: "Medicina Interna",
          userType: "professional",
        },
      });
      medicosProfileId = profile.id;

      const task = await prisma.task.create({
        data: {
          title: "Procedimiento complejo",
          status: "PENDING",
          priority: "MEDIUM",
          type: "PROCEDURE",
          assignedTo: medicosProfileId,
          createdBy: medicosProfileId,
          hospital: "Hospital Test",
        },
      });
      taskId = task.id;
    });

    it("debería crear items de checklist para una tarea", async () => {
      // Arrange
      const checklistItems = [
        { description: "Verificar identidad del paciente", order: 0 },
        { description: "Obtener consentimiento informado", order: 1 },
        { description: "Preparar equipo estéril", order: 2 },
      ];

      // Act
      const created = await prisma.taskChecklistItem.createMany({
        data: checklistItems.map((item) => ({ ...item, taskId })),
      });

      // Assert
      expect(created.count).toBe(3);
    });

    it("debería marcar item como completado", async () => {
      // Arrange
      const item = await prisma.taskChecklistItem.create({
        data: {
          taskId,
          description: "Verificar signos vitales",
          order: 0,
        },
      });

      // Act
      const updated = await prisma.taskChecklistItem.update({
        where: { id: item.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          completedBy: medicosProfileId,
        },
      });

      // Assert
      expect(updated.isCompleted).toBe(true);
      expect(updated.completedAt).toBeInstanceOf(Date);
      expect(updated.completedBy).toBe(medicosProfileId);
    });

    it("debería obtener checklist ordenado por orden", async () => {
      // Arrange
      await prisma.taskChecklistItem.createMany({
        data: [
          { taskId, description: "Paso 3", order: 2 },
          { taskId, description: "Paso 1", order: 0 },
          { taskId, description: "Paso 2", order: 1 },
        ],
      });

      // Act
      const items = await prisma.taskChecklistItem.findMany({
        where: { taskId },
        orderBy: { order: "asc" },
      });

      // Assert
      expect(items).toHaveLength(3);
      expect(items[0].description).toBe("Paso 1");
      expect(items[1].description).toBe("Paso 2");
      expect(items[2].description).toBe("Paso 3");
    });

    it("debería eliminar checklist al eliminar tarea (Cascade)", async () => {
      // Arrange
      await prisma.taskChecklistItem.create({
        data: { taskId, description: "Item de prueba", order: 0 },
      });

      // Act
      await prisma.task.delete({ where: { id: taskId } });

      // Assert
      const items = await prisma.taskChecklistItem.findMany({ where: { taskId } });
      expect(items).toHaveLength(0);
    });
  });

  describe("Relaciones entre modelos", () => {
    it("debería incluir notas SOAP al consultar paciente", async () => {
      // Arrange
      const patient = await prisma.patient.create({
        data: {
          medicalRecordNumber: "HC-REL-001",
          firstName: "Rel",
          lastName: "Test",
          dateOfBirth: new Date("1980-01-01"),
          gender: "M",
          bedNumber: "401",
          service: "Medicina",
          diagnosis: "Test",
          hospital: "Hospital Test",
          attendingDoctor: "Dr. Test",
        },
      });

      await prisma.soapNote.create({
        data: {
          patientId: patient.id,
          chiefComplaint: "Test",
          historyOfPresentIllness: "Test",
          physicalExam: "Test",
          assessment: "Test",
          plan: "Test",
          authorId: "user-123",
          hospital: "Hospital Test",
        },
      });

      // Act
      const patientWithNotes = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: { soapNotes: true },
      });

      // Assert
      expect(patientWithNotes?.soapNotes).toHaveLength(1);
    });

    it("debería incluir tareas al consultar paciente", async () => {
      // Arrange - primero crear usuario y perfil
      const user = await prisma.user.create({
        data: {
          id: "user-rel-" + Date.now(),
          email: `rel-${Date.now()}@example.com`,
          name: "Dr. Rel",
        },
      });

      const profile = await prisma.medicosProfile.create({
        data: {
          userId: user.id,
          fullName: "Dr. Rel Profile",
          hospital: "Hospital General",
          specialty: "Medicina Interna",
          userType: "professional",
        },
      });

      const patient = await prisma.patient.create({
        data: {
          medicalRecordNumber: "HC-REL-002",
          firstName: "Rel",
          lastName: "Test",
          dateOfBirth: new Date("1980-01-01"),
          gender: "M",
          bedNumber: "402",
          service: "Medicina",
          diagnosis: "Test",
          hospital: "Hospital Test",
          attendingDoctor: "Dr. Test",
        },
      });

      await prisma.task.create({
        data: {
          title: "Tarea relacionada",
          status: "PENDING",
          priority: "MEDIUM",
          type: "OTHER",
          patientId: patient.id,
          assignedTo: profile.id,
          createdBy: profile.id,
          hospital: "Hospital Test",
        },
      });

      // Act
      const patientWithTasks = await prisma.patient.findUnique({
        where: { id: patient.id },
        include: { tasks: true },
      });

      // Assert
      expect(patientWithTasks?.tasks).toHaveLength(1);
    });

    it("debería incluir checklist al consultar tarea", async () => {
      // Arrange - crear usuario, perfil y tarea
      const user = await prisma.user.create({
        data: {
          id: "user-check-" + Date.now(),
          email: `check-${Date.now()}@example.com`,
          name: "Dr. Check",
        },
      });

      const profile = await prisma.medicosProfile.create({
        data: {
          userId: user.id,
          fullName: "Dr. Check Profile",
          hospital: "Hospital General",
          specialty: "Medicina Interna",
          userType: "professional",
        },
      });

      const task = await prisma.task.create({
        data: {
          title: "Tarea con checklist",
          status: "PENDING",
          priority: "MEDIUM",
          type: "PROCEDURE",
          assignedTo: profile.id,
          createdBy: profile.id,
          hospital: "Hospital Test",
        },
      });

      await prisma.taskChecklistItem.create({
        data: { taskId: task.id, description: "Paso 1", order: 0 },
      });

      // Act
      const taskWithChecklist = await prisma.task.findUnique({
        where: { id: task.id },
        include: { checklist: true },
      });

      // Assert
      expect(taskWithChecklist?.checklist).toHaveLength(1);
    });
  });
});
