/**
 * Componente CriticalPatientCard
 *
 * Tarjeta visual para mostrar un paciente crítico en el handover.
 * Resalta con colores de emergencia y muestra el motivo de criticidad.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { AlertTriangle, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CriticalPatientInfo } from "@/services/handover/types";

interface CriticalPatientCardProps {
  patient: CriticalPatientInfo;
  onClick?: () => void;
  className?: string;
}

export function CriticalPatientCard({ patient, onClick, className }: CriticalPatientCardProps) {
  const getPriorityColor = (urgentCount: number): string => {
    if (urgentCount >= 2) return "bg-red-100 border-red-300 text-red-800";
    if (urgentCount === 1) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-yellow-100 border-yellow-300 text-yellow-800";
  };

  const formatDate = (date?: Date): string => {
    if (!date) return "Sin nota";
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4 transition-all",
        getPriorityColor(patient.urgentTasksCount),
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <h4 className="font-semibold">Cama {patient.bedNumber}</h4>
            <p className="text-sm font-medium">{patient.patientName}</p>
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="flex items-center gap-1 justify-end">
            <Clock className="h-3 w-3" />
            <span>{formatDate(patient.lastSoapDate)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 opacity-70" />
          <span className="font-medium">Motivo:</span>
        </div>
        <p className="text-sm pl-6">{patient.reason}</p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="font-medium">Tareas pendientes:</span>
          <span className={cn(
            "px-2 py-0.5 rounded-full font-bold",
            patient.pendingTasksCount > 0 ? "bg-red-200" : "bg-gray-200"
          )}>
            {patient.pendingTasksCount}
          </span>
        </div>
        {patient.urgentTasksCount > 0 && (
          <span className="px-2 py-0.5 bg-red-200 rounded-full font-bold">
            {patient.urgentTasksCount} URGENTE
          </span>
        )}
      </div>
    </div>
  );
}
