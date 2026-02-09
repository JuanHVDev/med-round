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
          <h2 className="text-2xl font-bold font-display">Resumen de Guardia</h2>
          <p className="text-muted-foreground">
            {handover.service} - {shiftLabels[handover.shiftType]} | {formatDate(handover.shiftDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium gap-1 flex items-center",
              handover.status === "FINALIZED" && "bg-green-500/10 text-green-600 border border-green-500/20",
              handover.status === "IN_PROGRESS" && "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20",
              handover.status === "DRAFT" && "bg-primary/10 text-primary border border-primary/20"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {statusLabels[handover.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-500" />
            <span className="text-sm text-cyan-600 font-medium">Pacientes</span>
          </div>
          <p className="text-2xl font-bold text-cyan-900 mt-1 font-mono">
            {handover.includedPatientIds.length}
          </p>
        </div>

        <div className="bg-teal-500/5 border border-teal-500/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-500" />
            <span className="text-sm text-teal-600 font-medium">Tareas</span>
          </div>
          <p className="text-2xl font-bold text-teal-900 mt-1 font-mono">
            {handover.includedTaskIds.length}
          </p>
        </div>

        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Críticos</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-1 font-mono">
            {criticalPatients.length}
          </p>
        </div>

        <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 font-medium">Versión</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1 font-mono">
            v{handover.version}
          </p>
        </div>
      </div>

      {criticalPatients.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 font-display">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Pacientes Críticos ({criticalPatients.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalPatients.map((patient) => (
              <div
                key={patient.patientId}
                className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 hover:bg-red-500/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold font-mono">Cama {patient.bedNumber}</span>
                  <span className="text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {patient.pendingTasksCount} tareas
                  </span>
                </div>
                <p className="font-medium mt-1">{patient.patientName}</p>
                <p className="text-sm text-red-700 mt-1">{patient.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {handover.generatedSummary && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Resumen Generado</h3>
            <div className="flex items-center gap-2">
              {onGeneratePdf && (
                <Button size="sm" variant="outline" onClick={onGeneratePdf}>
                  <Download className="h-4 w-4 mr-1" />
                  Descargar PDF
                </Button>
              )}
            </div>
          </div>
          <div className="bg-card/50 border border-primary/10 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {handover.generatedSummary}
            </pre>
          </div>
        </div>
      )}

      {handover.generalNotes && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-display">Notas Generales</h3>
            {onEditNotes && (
              <Button variant="ghost" size="sm" onClick={onEditNotes}>
                Editar
              </Button>
            )}
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <p className="whitespace-pre-wrap text-sm">{handover.generalNotes}</p>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-right font-mono">
        Generado: {formatDate(handover.createdAt)} | Última actualización:{" "}
        {formatDate(handover.updatedAt)}
      </div>
    </div>
  );
}
