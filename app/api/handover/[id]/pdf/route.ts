/**
 * API Endpoint: GET /api/handover/[id]/pdf
 *
 * Genera y descarga el PDF del handover.
 * Usa @react-pdf/renderer para generar el documento en el servidor.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import HandoverPDF from "@/components/handover/pdf/HandoverPDF";
import type { HandoverWithRelations, PatientHandoverInfo, TaskHandoverInfo, CriticalPatientInfo } from "@/services/handover/types";

/**
 * GET /api/handover/[id]/pdf
 * Genera y descarga el PDF del handover
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const rateLimit = await checkRateLimit(
      `handover:pdf:${session.user.id}`,
      10,
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

    const handover = await prisma.handover.findUnique({
      where: { id },
    });

    if (!handover) {
      return NextResponse.json(
        { error: "Handover no encontrado", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const profile = await prisma.medicosProfile.findUnique({
      where: { userId: session.user.id },
      select: { hospital: true },
    });

    if (profile && handover.hospital !== profile.hospital) {
      return NextResponse.json(
        { error: "No autorizado para acceder a este handover", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    const criticalPatients = (handover.criticalPatients as unknown as CriticalPatientInfo[] | undefined) || [];

    const patientIds = (handover.includedPatientIds as string[]) || [];

    const patients = await Promise.all(
      patientIds.map(async (patientId) => {
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
        });

        if (!patient) return null;

        const latestSoap = await prisma.soapNote.findFirst({
          where: { patientId: patient.id },
          orderBy: { createdAt: "desc" },
        });

        const vitalSignsData = latestSoap?.vitalSigns as Record<string, unknown> | null;

        return {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          medicalRecordNumber: patient.medicalRecordNumber,
          bedNumber: patient.bedNumber,
          diagnosis: patient.diagnosis,
          allergies: patient.allergies || undefined,
          bloodType: patient.bloodType || undefined,
          admissionDate: patient.admissionDate,
          latestSoap: latestSoap ? {
            id: latestSoap.id,
            date: latestSoap.createdAt,
            chiefComplaint: latestSoap.chiefComplaint,
            assessment: latestSoap.assessment,
            plan: latestSoap.plan,
            vitalSigns: vitalSignsData as {
              bloodPressure?: string;
              heartRate?: string;
              temperature?: string;
              oxygenSaturation?: string;
              respiratoryRate?: string;
            } | undefined,
          } : undefined,
        } as PatientHandoverInfo;
      })
    );

    const filteredPatients = patients.filter((p): p is PatientHandoverInfo => p !== null);

    const taskIds = (handover.includedTaskIds as string[]) || [];
    const tasks: TaskHandoverInfo[] = [];

    if (taskIds.length > 0) {
      const dbTasks = await prisma.task.findMany({
        where: { id: { in: taskIds } },
        include: {
          assignee: {
            select: { fullName: true },
          },
        },
      });

      tasks.push(...dbTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate || undefined,
        patientId: task.patientId || undefined,
        assignedToName: task.assignee?.fullName,
      })));
    }

    const handoverData: HandoverWithRelations = {
      id: handover.id,
      hospital: handover.hospital,
      service: handover.service,
      shiftType: handover.shiftType,
      shiftDate: handover.shiftDate,
      startTime: handover.startTime,
      endTime: handover.endTime ?? undefined,
      createdBy: handover.createdBy,
      creatorName: undefined,
      status: handover.status,
      includedPatientIds: patientIds,
      includedTaskIds: taskIds,
      checklistItems: (handover.checklistItems as unknown as Array<{
        id: string;
        description: string;
        isCompleted: boolean;
        completedBy?: string;
        completedAt?: Date;
        order: number;
      }>) || [],
      generalNotes: handover.generalNotes ?? undefined,
      generatedSummary: handover.generatedSummary ?? undefined,
      criticalPatients: criticalPatients || [],
      finalizedAt: handover.finalizedAt ?? undefined,
      pdfUrl: handover.pdfUrl ?? undefined,
      version: handover.version,
      createdAt: handover.createdAt,
      updatedAt: handover.updatedAt,
    };

    const pdfElement = HandoverPDF({
      handover: handoverData,
      patients: filteredPatients,
      tasks,
      criticalPatients: criticalPatients || [],
    });

    const pdfBuffer = await renderToBuffer(pdfElement as ReactElement<DocumentProps>);

    const uint8Array = new Uint8Array(pdfBuffer);

    const fileName = `handover_${handover.hospital}_${new Date(handover.shiftDate).toISOString().split("T")[0]}.pdf`;

    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        ...getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      },
    });
  } catch (error) {
    console.error("Error generating handover PDF:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
