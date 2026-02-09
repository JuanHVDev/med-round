/**
 * Página de Detalle de Handover
 *
 * Visualiza un handover completo con resumen, pacientes críticos,
 * y opciones para editar, finalizar o descargar PDF.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverDetailClient } from "./HandoverDetailClient";
import type { HandoverWithRelations, PatientHandoverInfo } from "@/services/handover/types";
import { headers } from "next/headers";

interface HandoverPageProps {
  params: Promise<{ id: string }>;
}

// Asegurar que la página no use cache y siempre obtenga datos frescos
export const dynamic = "force-dynamic";

export default async function HandoverDetailPage({ params }: HandoverPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-8">
        <p>Debes iniciar sesión</p>
      </div>
    );
  }

  const { id } = await params;

  const handover = await prisma.handover.findUnique({
    where: { id },
    include: {
      creator: {
        select: { fullName: true },
      },
    },
  });

  if (!handover) {
    notFound();
  }

  const patients = await prisma.patient.findMany({
    where: {
      id: { in: (handover.includedPatientIds as string[]) || [] },
    },
  });

  const criticalPatients = (handover.criticalPatients as Array<{
    patientId: string;
    bedNumber: string;
    patientName: string;
    reason: string;
    pendingTasksCount: number;
    urgentTasksCount: number;
  }>) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/handover">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Handover</h1>
          <p className="text-muted-foreground">
            {handover.service} - {handover.shiftType}
          </p>
        </div>
      </div>

      <HandoverDetailClient
        handover={{
          ...handover,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shiftType: handover.shiftType as any,
          shiftDate: new Date(handover.shiftDate),
          startTime: new Date(handover.startTime),
          endTime: handover.endTime ? new Date(handover.endTime) : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          creatorName: (handover.creator as any)?.fullName || undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: handover.status as any,
          includedPatientIds: (handover.includedPatientIds || []) as string[],
          includedTaskIds: (handover.includedTaskIds || []) as string[],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          checklistItems: (handover.checklistItems || []) as any[],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          criticalPatients: criticalPatients as any,
          finalizedAt: handover.finalizedAt ? new Date(handover.finalizedAt) : undefined,
          createdAt: new Date(handover.createdAt),
          updatedAt: new Date(handover.updatedAt),
        } as HandoverWithRelations}
         
        patients={(patients || []).map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          dateOfBirth: new Date(p.dateOfBirth),
          admissionDate: p.admissionDate ? new Date(p.admissionDate) : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: (p as any).status,
        })) as PatientHandoverInfo[]}
      />
    </div>
  );
}
