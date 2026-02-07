import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";

describe("API Tasks Integration", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe("GET /api/tasks", () => {
    it("debería retornar 401 si no hay sesión", async () => {
      vi.doMock("@/lib/auth", () => ({
        auth: {
          api: {
            getSession: vi.fn().mockResolvedValue(null),
          },
        },
      }));

      const { GET } = await import("@/app/api/tasks/route");
      const request = new NextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("debería listar tareas con filtros", async () => {
      vi.doMock("@/lib/auth", () => ({
        auth: {
          api: {
            getSession: vi.fn().mockResolvedValue({
              user: { id: "user-123" },
            }),
          },
        },
      }));

      vi.doMock("@/lib/rate-limit", () => ({
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
        getRateLimitHeaders: vi.fn().mockReturnValue({}),
      }));

      vi.doMock("@/lib/prisma", () => ({
        prisma: {
          medicosProfile: {
            findUnique: vi.fn().mockResolvedValue({
              id: "profile-123",
              userId: "user-123",
              fullName: "Dr. Test",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              professionalId: null,
              studentType: null,
              universityMatricula: null,
              otherHospital: null,
              specialty: "Medicina",
              userType: "residente",
              isEmailVerified: true,
            }),
          },
          task: {
            findMany: vi.fn().mockResolvedValue([]),
            count: vi.fn().mockResolvedValue(0),
          },
        },
      }));

      const { GET } = await import("@/app/api/tasks/route");
      const request = new NextRequest("http://localhost:3000/api/tasks?status=PENDING&page=1&limit=20");
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tasks).toBeDefined();
    });
  });

  describe("POST /api/tasks", () => {
    it("debería crear una tarea", async () => {
      vi.doMock("@/lib/auth", () => ({
        auth: {
          api: {
            getSession: vi.fn().mockResolvedValue({
              user: { id: "user-123" },
            }),
          },
        },
      }));

      vi.doMock("@/lib/rate-limit", () => ({
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
        getRateLimitHeaders: vi.fn().mockReturnValue({}),
      }));

      vi.doMock("@/lib/prisma", () => ({
        prisma: {
          medicosProfile: {
            findUnique: vi.fn().mockResolvedValue({
              id: "profile-123",
              userId: "user-123",
              fullName: "Dr. Test",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              professionalId: null,
              studentType: null,
              universityMatricula: null,
              otherHospital: null,
              specialty: "Medicina",
              userType: "residente",
              isEmailVerified: true,
            }),
          },
          patient: {
            findUnique: vi.fn().mockResolvedValue({
              id: "patient-123",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              isActive: true,
              service: "Medicina Interna",
              medicalRecordNumber: "MRN001",
              firstName: "Juan",
              lastName: "Pérez",
              dateOfBirth: new Date(),
              gender: "M",
              diagnosis: "Neumonía",
              attendingDoctor: "Dr. García",
              bedNumber: "101A",
              roomNumber: "101",
              allergies: null,
              bloodType: null,
              emergencyContactName: null,
              emergencyContactPhone: null,
              insuranceProvider: null,
              insuranceNumber: null,
              weight: null,
              height: null,
              specialNotes: null,
              dietType: null,
              isolationPrecautions: null,
            }),
          },
          task: {
            create: vi.fn().mockResolvedValue({
              id: "task-123",
              title: "Nueva tarea",
              status: "PENDING",
              priority: "HIGH",
              type: "LABORATORY",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              description: null,
              patientId: null,
              assignedTo: "profile-123",
              createdBy: "user-123",
              dueDate: null,
              completedAt: null,
              service: null,
              shift: null,
            }),
          },
        },
      }));

      const { POST } = await import("@/app/api/tasks/route");
      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "Nueva tarea",
          priority: "HIGH",
          assignedTo: "223e4567-e89b-12d3-a456-426614174001",
          hospital: "Hospital General",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe("PATCH /api/tasks/:id", () => {
    it("debería actualizar una tarea", async () => {
      vi.doMock("@/lib/auth", () => ({
        auth: {
          api: {
            getSession: vi.fn().mockResolvedValue({
              user: { id: "user-123" },
            }),
          },
        },
      }));

      vi.doMock("@/lib/rate-limit", () => ({
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
        getRateLimitHeaders: vi.fn().mockReturnValue({}),
      }));

      vi.doMock("@/lib/prisma", () => ({
        prisma: {
          medicosProfile: {
            findUnique: vi.fn().mockResolvedValue({
              id: "profile-123",
              userId: "user-123",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              fullName: "Dr. Test",
              professionalId: null,
              studentType: null,
              universityMatricula: null,
              otherHospital: null,
              specialty: "Medicina",
              userType: "residente",
              isEmailVerified: true,
            }),
          },
          task: {
            findUnique: vi.fn().mockResolvedValue({
              id: "task-123",
              title: "Título original",
              status: "PENDING",
              priority: "MEDIUM",
              type: "OTHER",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              description: null,
              patientId: null,
              assignedTo: "profile-123",
              createdBy: "user-123",
              dueDate: null,
              completedAt: null,
              service: null,
              shift: null,
            }),
            update: vi.fn().mockResolvedValue({
              id: "task-123",
              title: "Título actualizado",
              status: "IN_PROGRESS",
              priority: "HIGH",
              type: "OTHER",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              description: null,
              patientId: null,
              assignedTo: "profile-123",
              createdBy: "user-123",
              dueDate: null,
              completedAt: null,
              service: null,
              shift: null,
            }),
          },
        },
      }));

      const { PATCH } = await import("@/app/api/tasks/[id]/route");
      const request = new NextRequest("http://localhost:3000/api/tasks/task-123", {
        method: "PATCH",
        body: JSON.stringify({ title: "Título actualizado" }),
      });

      const response = await PATCH(request, { params: Promise.resolve({ id: "task-123" }) });

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("debería eliminar una tarea", async () => {
      vi.doMock("@/lib/auth", () => ({
        auth: {
          api: {
            getSession: vi.fn().mockResolvedValue({
              user: { id: "user-123" },
            }),
          },
        },
      }));

      vi.doMock("@/lib/rate-limit", () => ({
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
        getRateLimitHeaders: vi.fn().mockReturnValue({}),
      }));

      vi.doMock("@/lib/prisma", () => ({
        prisma: {
          medicosProfile: {
            findUnique: vi.fn().mockResolvedValue({
              id: "profile-123",
              userId: "user-123",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              fullName: "Dr. Test",
              professionalId: null,
              studentType: null,
              universityMatricula: null,
              otherHospital: null,
              specialty: "Medicina",
              userType: "residente",
              isEmailVerified: true,
            }),
          },
          task: {
            findUnique: vi.fn().mockResolvedValue({
              id: "task-123",
              createdAt: new Date(),
              updatedAt: new Date(),
              title: "Tarea",
              status: "PENDING",
              priority: "MEDIUM",
              type: "OTHER",
              hospital: "Hospital General",
              description: null,
              patientId: null,
              assignedTo: "profile-123",
              createdBy: "user-123",
              dueDate: null,
              completedAt: null,
              service: null,
              shift: null,
            }),
            delete: vi.fn().mockResolvedValue({ id: "task-123" }),
          },
        },
      }));

      const { DELETE } = await import("@/app/api/tasks/[id]/route");
      const request = new NextRequest("http://localhost:3000/api/tasks/task-123", {
        method: "DELETE",
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: "task-123" }) });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/tasks/:id/complete", () => {
    it("debería completar una tarea", async () => {
      vi.doMock("@/lib/auth", () => ({
        auth: {
          api: {
            getSession: vi.fn().mockResolvedValue({
              user: { id: "user-123" },
            }),
          },
        },
      }));

      vi.doMock("@/lib/rate-limit", () => ({
        checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, resetTime: Date.now() + 60000 }),
        getRateLimitHeaders: vi.fn().mockReturnValue({}),
      }));

      vi.doMock("@/lib/prisma", () => ({
        prisma: {
          medicosProfile: {
            findUnique: vi.fn().mockResolvedValue({
              id: "profile-123",
              userId: "user-123",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              fullName: "Dr. Test",
              professionalId: null,
              studentType: null,
              universityMatricula: null,
              otherHospital: null,
              specialty: "Medicina",
              userType: "residente",
              isEmailVerified: true,
            }),
          },
          task: {
            findUnique: vi.fn().mockResolvedValue({
              id: "task-123",
              title: "Tarea",
              status: "PENDING",
              priority: "MEDIUM",
              type: "OTHER",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              description: null,
              patientId: null,
              assignedTo: "profile-123",
              createdBy: "user-123",
              dueDate: null,
              completedAt: null,
              service: null,
              shift: null,
            }),
            update: vi.fn().mockResolvedValue({
              id: "task-123",
              title: "Tarea",
              status: "COMPLETED",
              priority: "MEDIUM",
              type: "OTHER",
              hospital: "Hospital General",
              createdAt: new Date(),
              updatedAt: new Date(),
              description: null,
              patientId: null,
              assignedTo: "profile-123",
              createdBy: "user-123",
              dueDate: null,
              completedAt: new Date(),
              service: null,
              shift: null,
            }),
          },
        },
      }));

      const { POST } = await import("@/app/api/tasks/[id]/complete/route");
      const request = new NextRequest("http://localhost:3000/api/tasks/task-123/complete", {
        method: "POST",
      });

      const response = await POST(request, { params: Promise.resolve({ id: "task-123" }) });

      expect(response.status).toBe(200);
    });
  });
});
