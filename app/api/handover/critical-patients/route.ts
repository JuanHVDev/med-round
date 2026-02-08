/**
 * API Endpoint: POST /api/handover/critical-patients
 *
 * Detecta pacientes críticos basándose en:
 * - Tareas URGENT pendientes
 * - Tareas HIGH vencidas
 * - Sin nota SOAP en últimas 24 horas
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import type { CriticalPatientInfo } from "@/services/handover/types";

interface CriticalPatientsRequest {
  patientIds: string[];
  hospital: string;
}

/**
 * POST /api/handover/critical-patients
 * Detecta pacientes críticos
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(
      `handover:critical:${session.user.id}`,
      30,
      60
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Límite de solicitudes excedido" },
        {
          status: 429,
          headers: getRateLimitHeaders(0, rateLimit.resetTime),
        }
      );
    }

    const body: CriticalPatientsRequest = await request.json();

    if (!body.patientIds || body.patientIds.length === 0) {
      return NextResponse.json({ criticalPatients: [] });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const criticalPatients: CriticalPatientInfo[] = [];

    for (const patientId of body.patientIds) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          bedNumber: true,
          hospital: true,
        },
      });

      if (!patient || patient.hospital !== body.hospital) {
        continue;
      }

      const reasons: string[] = [];

      const urgentTasks = await prisma.task.count({
        where: {
          patientId: patientId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          priority: "URGENT",
        },
      });

      const overdueTasks = await prisma.task.count({
        where: {
          patientId: patientId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
          priority: "HIGH",
          dueDate: { lt: now },
        },
      });

      const recentSoapNotes = await prisma.soapNote.count({
        where: {
          patientId: patientId,
          date: { gte: twentyFourHoursAgo },
        },
      });

      if (urgentTasks > 0) {
        reasons.push(`${urgentTasks} tarea(s) URGENTE`);
      }

      if (overdueTasks > 0) {
        reasons.push(`${overdueTasks} tarea(s) HIGH vencida(s)`);
      }

      if (recentSoapNotes === 0) {
        reasons.push("Sin nota SOAP en 24h");
      }

      if (reasons.length > 0) {
        criticalPatients.push({
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          bedNumber: patient.bedNumber,
          reason: reasons.join(" • "),
          pendingTasksCount: urgentTasks + overdueTasks,
          urgentTasksCount: urgentTasks,
          highOverdueTasksCount: overdueTasks,
          lastSoapDate: recentSoapNotes > 0 ? now : undefined,
        });
      }
    }

    criticalPatients.sort((a, b) => b.pendingTasksCount - a.pendingTasksCount);

    return NextResponse.json(
      {
        criticalPatients,
        count: criticalPatients.length,
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining || 29, rateLimit.resetTime),
      }
    );
  } catch (error) {
    console.error("Error detecting critical patients:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
