"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ClipboardList,
  Activity,
  TestTube,
  Scan,
  Pill,
  Clock,
  User,
  Edit,
  Droplets,
  Heart,
  Thermometer,
  Wind,
  Scale,
  Ruler,
} from "lucide-react";
import type { SoapNoteWithRelations } from "@/services/soap/types";
import type { VitalSigns } from "@/services/soap/types";
import { MedRoundLogo } from "@/components/ui/med-round-logo";

interface SoapNoteViewProps {
  note: SoapNoteWithRelations;
  onEdit?: () => void;
  showActions?: boolean;
}

interface VitalSignsCardProps {
  vitalSigns: VitalSigns | null;
}

function VitalSignsCard({ vitalSigns }: VitalSignsCardProps) {
  if (!vitalSigns || Object.keys(vitalSigns).filter(k => vitalSigns[k as keyof VitalSigns] !== undefined).length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic p-4 bg-primary/5 rounded-lg border border-primary/10">
        No se registraron signos vitales
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {vitalSigns.bloodPressure && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Activity className="h-4 w-4 text-cyan-500" />
          <div>
            <p className="text-xs text-muted-foreground font-display">PA</p>
            <p className="font-medium font-mono">{vitalSigns.bloodPressure} mmHg</p>
          </div>
        </div>
      )}
      {vitalSigns.heartRate && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Heart className="h-4 w-4 text-red-500" />
          <div>
            <p className="text-xs text-muted-foreground font-display">FC</p>
            <p className="font-medium font-mono">{vitalSigns.heartRate} lpm</p>
          </div>
        </div>
      )}
      {vitalSigns.temperature && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Thermometer className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-xs text-muted-foreground font-display">Temp</p>
            <p className="font-medium font-mono">{vitalSigns.temperature} °C</p>
          </div>
        </div>
      )}
      {vitalSigns.respiratoryRate && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Wind className="h-4 w-4 text-teal-500" />
          <div>
            <p className="text-xs text-muted-foreground font-display">FR</p>
            <p className="font-medium font-mono">{vitalSigns.respiratoryRate} rpm</p>
          </div>
        </div>
      )}
      {vitalSigns.oxygenSaturation && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Droplets className="h-4 w-4 text-cyan-500" />
          <div>
            <p className="text-xs text-muted-foreground font-display">SpO2</p>
            <p className="font-medium font-mono">{vitalSigns.oxygenSaturation}%</p>
          </div>
        </div>
      )}
      {vitalSigns.weight && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Scale className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground font-display">Peso</p>
            <p className="font-medium font-mono">{vitalSigns.weight} kg</p>
          </div>
        </div>
      )}
      {vitalSigns.height && (
        <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
          <Ruler className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground font-display">Talla</p>
            <p className="font-medium font-mono">{vitalSigns.height} cm</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SoapNoteView({ note, onEdit, showActions = true }: SoapNoteViewProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-3">
            <MedRoundLogo size="sm" />
            Nota SOAP
          </h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">Fecha: {formatDate(note.date)}</p>
        </div>
        {showActions && onEdit && (
          <Button onClick={onEdit} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
            <Edit className="h-4 w-4" />
            Editar Nota
          </Button>
        )}
      </div>

      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              <CardTitle className="font-display">Información General</CardTitle>
            </div>
            <Badge variant="outline" className="border-primary/20 gap-1">
              <span className="w-1 h-1 rounded-full bg-cyan-500" />
              {note.hospital}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {note.patient && (
              <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
                <User className="h-4 w-4 text-cyan-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-display">Paciente</p>
                  <p className="font-medium">
                    {note.patient.firstName} {note.patient.lastName}
                  </p>
                </div>
              </div>
            )}
            {note.patient && (note.patient.roomNumber || note.patient.bedNumber) && (
              <div className="flex items-center gap-2 p-3 bg-card/50 border border-primary/10 rounded-lg">
                <Activity className="h-4 w-4 text-teal-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-display">Ubicación</p>
                  <p className="font-medium font-mono">
                    {note.patient.roomNumber && `Hab. ${note.patient.roomNumber}`}
                    {note.patient.roomNumber && note.patient.bedNumber && " - "}
                    {note.patient.bedNumber && `Cama ${note.patient.bedNumber}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-cyan-500" />
            <CardTitle className="font-display">Motivo de Consulta</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap font-mono text-sm">{note.chiefComplaint}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <CardTitle className="font-display">Historia de la Enfermedad Actual</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap font-mono text-sm">{note.historyOfPresentIllness}</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            <CardTitle className="font-display">Signos Vitales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <VitalSignsCard vitalSigns={note.vitalSigns} />
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-500" />
            <CardTitle className="font-display">Exploración Física</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap font-mono text-sm">{note.physicalExam}</p>
        </CardContent>
      </Card>

      {(note.laboratoryResults || note.imagingResults) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {note.laboratoryResults && (
            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-cyan-500" />
                  <CardTitle className="font-display">Laboratorio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap font-mono text-sm">{note.laboratoryResults}</p>
              </CardContent>
            </Card>
          )}
          {note.imagingResults && (
            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-teal-500" />
                  <CardTitle className="font-display">Imagen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap font-mono text-sm">{note.imagingResults}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-500" />
            <CardTitle className="font-display">Evaluación y Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2 font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              Evaluación / Impresión Diagnóstica
            </h4>
            <p className="whitespace-pre-wrap font-mono text-sm pl-4">{note.assessment}</p>
          </div>
          <div className="border-t border-primary/10" />
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2 font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Plan Terapéutico
            </h4>
            <p className="whitespace-pre-wrap font-mono text-sm pl-4">{note.plan}</p>
          </div>
        </CardContent>
      </Card>

      {(note.medications || note.pendingStudies) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {note.medications && (
            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-red-500" />
                  <CardTitle className="font-display">Medicamentos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap font-mono text-sm">{note.medications}</p>
              </CardContent>
            </Card>
          )}
          {note.pendingStudies && (
            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-teal-500" />
                  <CardTitle className="font-display">Estudios Pendientes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap font-mono text-sm">{note.pendingStudies}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center font-mono pt-4 border-t border-primary/10">
        Creado: {formatDate(note.createdAt)}
        {note.updatedAt !== note.createdAt && ` | Actualizado: ${formatDate(note.updatedAt)}`}
      </div>
    </div>
  );
}
