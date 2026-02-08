/**
 * Componente HandoverSummary
 *
 * Visualización del resumen generado de un handover.
 * Muestra estadísticas, pacientes críticos, y permite
 * copiar o descargar el resumen en markdown.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { Download, AlertTriangle, Users, ClipboardList, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { HandoverWithRelations, CriticalPatientInfo } from "@/services/handover/types";

interface HandoverSummaryProps {
  handover: HandoverWithRelations;
  criticalPatients: CriticalPatientInfo[];
  onEditNotes?: () => void;
  onGeneratePdf?: () => void;
  className?: string;
}

export function HandoverSummary({
  handover,
  criticalPatients,
  onEditNotes,
  onGeneratePdf,
  className,
}: HandoverSummaryProps) {
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusLabels = {
    DRAFT: "Borrador",
    IN_PROGRESS: "En Progreso",
    FINALIZED: "Finalizado",
  };

  const shiftLabels = {
    MORNING: "Mañana",
    AFTERNOON: "Tarde",
    NIGHT: "Noche",
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resumen de Guardia</h2>
          <p className="text-muted-foreground">
            {handover.service} - {shiftLabels[handover.shiftType]} | {formatDate(handover.shiftDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              handover.status === "FINALIZED" && "bg-green-100 text-green-800",
              handover.status === "IN_PROGRESS" && "bg-blue-100 text-blue-800",
              handover.status === "DRAFT" && "bg-gray-100 text-gray-800"
            )}
          >
            {statusLabels[handover.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-600">Pacientes</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {handover.includedPatientIds.length}
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-600">Tareas</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {handover.includedTaskIds.length}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-red-600">Críticos</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {criticalPatients.length}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600">Versión</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            v{handover.version}
          </p>
        </div>
      </div>

      {criticalPatients.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Pacientes Críticos ({criticalPatients.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalPatients.map((patient) => (
              <div
                key={patient.patientId}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Cama {patient.bedNumber}</span>
                  <span className="text-sm text-red-600">
                    {patient.pendingTasksCount} tareas
                  </span>
                </div>
                <p className="font-medium">{patient.patientName}</p>
                <p className="text-sm text-red-700 mt-1">{patient.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {handover.generatedSummary && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Resumen Generado</h3>
            <div className="flex items-center gap-2">
              {onGeneratePdf && (
                <Button size="sm" onClick={onGeneratePdf}>
                  <Download className="h-4 w-4 mr-1" />
                  Descargar PDF
                </Button>
              )}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {handover.generatedSummary}
            </pre>
          </div>
        </div>
      )}

      {handover.generalNotes && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notas Generales</h3>
            {onEditNotes && (
              <Button variant="ghost" size="sm" onClick={onEditNotes}>
                Editar
              </Button>
            )}
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="whitespace-pre-wrap text-sm">{handover.generalNotes}</p>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-right">
        Generado: {formatDate(handover.createdAt)} | Última actualización:{" "}
        {formatDate(handover.updatedAt)}
      </div>
    </div>
  );
}
