"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  ChevronRight,
  Plus,
  Activity,
  Clock,
  Calendar,
  ClipboardList,
  Loader2,
} from "lucide-react";
import type { SoapNoteWithRelations } from "@/services/soap/types";
import Link from "next/link";

interface SoapNoteListProps {
  notes: SoapNoteWithRelations[];
  patientId: string;
  isLoading?: boolean;
  onCreateNew?: () => void;
}

export function SoapNoteList({ notes, patientId, isLoading, onCreateNew }: SoapNoteListProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getVitalSignsSummary = (vitalSigns: SoapNoteWithRelations["vitalSigns"]) => {
    if (!vitalSigns) return null;
    const signs = [];
    if (vitalSigns.bloodPressure) signs.push(`PA: ${vitalSigns.bloodPressure}`);
    if (vitalSigns.heartRate) signs.push(`FC: ${vitalSigns.heartRate}`);
    if (vitalSigns.temperature) signs.push(`Temp: ${vitalSigns.temperature}°C`);
    return signs.length > 0 ? signs.join(" | ") : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardContent className="py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay notas SOAP</h3>
            <p className="text-muted-foreground mb-4">
              Este paciente aún no tiene notas de evolución registradas.
            </p>
            {onCreateNew && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Nota SOAP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Notas SOAP ({notes.length})</h2>
        {onCreateNew && (
          <Button onClick={onCreateNew} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Nota
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {notes.map((note) => {
          const vitalSignsSummary = getVitalSignsSummary(note.vitalSigns);
          return (
            <Link
              key={note.id}
              href={`/patients/${patientId}/soap/${note.id}`}
              className="block"
            >
              <Card className="shadow-sm border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">
                          {formatDate(note.date)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {note.hospital}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <ClipboardList className="h-3 w-3" />
                            <span>Motivo: {note.chiefComplaint.substring(0, 80)}...</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Activity className="h-3 w-3" />
                            <span>Plan: {note.plan.substring(0, 80)}...</span>
                          </div>
                        </div>

                        {vitalSignsSummary && (
                          <div className="flex items-center gap-1 text-muted-foreground bg-slate-50 p-2 rounded">
                            <Activity className="h-3 w-3 text-red-500" />
                            <span>{vitalSignsSummary}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Creado: {formatDate(note.createdAt)}</span>
                        </div>
                        {note.updatedAt !== note.createdAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Actualizado: {formatDate(note.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
