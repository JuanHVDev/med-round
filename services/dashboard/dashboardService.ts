import { PrismaClient } from "@prisma/client";
import type {
  DashboardStats,
  RecentPatient,
  PendingTask,
} from "./types";

interface VitalSigns {
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
}

function isVitalSignsCritical(vitals: VitalSigns): boolean {
  if (!vitals) return false;

  const { heartRate, bloodPressureSystolic, bloodPressureDiastolic, respiratoryRate, oxygenSaturation, temperature } = vitals;

  if (heartRate && (heartRate > 120 || heartRate < 40)) return true;
  if (bloodPressureSystolic && bloodPressureSystolic > 180) return true;
  if (bloodPressureDiastolic && bloodPressureDiastolic > 120) return true;
  if (respiratoryRate && (respiratoryRate > 30 || respiratoryRate < 8)) return true;
  if (oxygenSaturation && oxygenSaturation < 90) return true;
  if (temperature && (temperature > 39 || temperature < 35)) return true;

  return false;
}

export class DashboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getStats(hospital?: string): Promise<DashboardStats> {
    try {
      const hospitalFilter = hospital ? { hospital } : undefined;

      const [totalPatients, pendingTasks, todayNotes, criticalPatients] = await Promise.all([
        this.prisma.patient.count({
          where: {
            ...hospitalFilter,
            isActive: true,
          },
        }),
        this.prisma.task.count({
          where: {
            ...hospitalFilter,
            status: { in: ["PENDING", "IN_PROGRESS"] },
          },
        }),
        this.prisma.soapNote.count({
          where: {
            ...hospitalFilter,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        this.countCriticalPatients(hospitalFilter),
      ]);

      return {
        totalPatients,
        pendingTasks,
        criticalPatients,
        notesToday: todayNotes,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return {
        totalPatients: 0,
        pendingTasks: 0,
        criticalPatients: 0,
        notesToday: 0,
      };
    }
  }

  private async countCriticalPatients(hospitalFilter?: { hospital: string }): Promise<number> {
    const activePatients = await this.prisma.patient.findMany({
      where: {
        ...hospitalFilter,
        isActive: true,
      },
      select: { id: true },
    });

    let criticalCount = 0;

    for (const patient of activePatients) {
      const latestNote = await this.prisma.soapNote.findFirst({
        where: {
          patientId: patient.id,
        },
        orderBy: { date: "desc" },
        select: { vitalSigns: true },
      });

      if (latestNote?.vitalSigns && Object.keys(latestNote.vitalSigns as object).length > 0 && isVitalSignsCritical(latestNote.vitalSigns as VitalSigns)) {
        criticalCount++;
      }
    }

    return criticalCount;
  }

  async getRecentPatients(
    hospital?: string,
    limit: number = 5
  ): Promise<RecentPatient[]> {
    try {
      const hospitalFilter = hospital ? { hospital } : undefined;

      const patients = await this.prisma.patient.findMany({
        where: {
          ...hospitalFilter,
          isActive: true,
        },
        orderBy: { admissionDate: "desc" },
        take: limit,
      });

      return patients.map((patient) => ({
        id: patient.id,
        name: `${patient.firstName} ${patient.lastName}`,
        bedNumber: patient.bedNumber,
        lastVisit: patient.updatedAt,
        condition: "Estable",
      }));
    } catch (error) {
      console.error("Error getting recent patients:", error);
      return [];
    }
  }

  async getPendingTasks(
    hospital?: string,
    limit: number = 5
  ): Promise<PendingTask[]> {
    try {
      const hospitalFilter = hospital ? { hospital } : undefined;

      const tasks = await this.prisma.task.findMany({
        where: {
          ...hospitalFilter,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              bedNumber: true,
            },
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
      });

      return tasks.map((task) => ({
        id: task.id,
        title: task.title,
        priority: this.mapPriority(task.priority),
        patientName: task.patient
          ? `${task.patient.firstName} ${task.patient.lastName}`
          : "Sin paciente",
        patientId: task.patient?.id || "",
        dueDate: task.dueDate || undefined,
      }));
    } catch (error) {
      console.error("Error getting pending tasks:", error);
      return [];
    }
  }

  private mapPriority(
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  ): "baja" | "media" | "alta" | "urgente" {
    const map: Record<
      "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "baja" | "media" | "alta" | "urgente"
    > = {
      LOW: "baja",
      MEDIUM: "media",
      HIGH: "alta",
      URGENT: "urgente",
    };
    return map[priority];
  }
}
