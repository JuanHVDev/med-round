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

interface SoapNoteViewProps {
  note: SoapNoteWithRelations;
  onEdit?: () => void;
  showActions?: boolean;
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

  const VitalSignsCard = ({ vitalSigns }: { vitalSigns: VitalSigns | null }) => {
    if (!vitalSigns || Object.keys(vitalSigns).filter(k => vitalSigns[k as keyof VitalSigns] !== undefined).length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No se registraron signos vitales
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {vitalSigns.bloodPressure && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Activity className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-xs text-muted-foreground">PA</p>
              <p className="font-medium">{vitalSigns.bloodPressure} mmHg</p>
            </div>
          </div>
        )}
        {vitalSigns.heartRate && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Heart className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">FC</p>
              <p className="font-medium">{vitalSigns.heartRate} lpm</p>
            </div>
          </div>
        )}
        {vitalSigns.temperature && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Temp</p>
              <p className="font-medium">{vitalSigns.temperature} °C</p>
            </div>
          </div>
        )}
        {vitalSigns.respiratoryRate && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Wind className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">FR</p>
              <p className="font-medium">{vitalSigns.respiratoryRate} rpm</p>
            </div>
          </div>
        )}
        {vitalSigns.oxygenSaturation && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Droplets className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">SpO2</p>
              <p className="font-medium">{vitalSigns.oxygenSaturation}%</p>
            </div>
          </div>
        )}
        {vitalSigns.weight && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Scale className="h-4 w-4" />
            <div>
              <p className="text-xs text-muted-foreground">Peso</p>
              <p className="font-medium">{vitalSigns.weight} kg</p>
            </div>
          </div>
        )}
        {vitalSigns.height && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Ruler className="h-4 w-4" />
            <div>
              <p className="text-xs text-muted-foreground">Talla</p>
              <p className="font-medium">{vitalSigns.height} cm</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nota SOAP</h2>
          <p className="text-muted-foreground">Fecha: {formatDate(note.date)}</p>
        </div>
        {showActions && onEdit && (
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Editar Nota
          </Button>
        )}
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Información General</CardTitle>
            </div>
            <Badge variant="outline">{note.hospital}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {note.patient && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Paciente</p>
                  <p className="font-medium">
                    {note.patient.firstName} {note.patient.lastName}
                  </p>
                </div>
              </div>
            )}
            {note.patient && (note.patient.roomNumber || note.patient.bedNumber) && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">
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

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Motivo de Consulta</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap">{note.chiefComplaint}</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Historia de la Enfermedad Actual</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap">{note.historyOfPresentIllness}</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            <CardTitle className="text-lg">Signos Vitales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <VitalSignsCard vitalSigns={note.vitalSigns} />
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Exploración Física</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap">{note.physicalExam}</p>
        </CardContent>
      </Card>

      {(note.laboratoryResults || note.imagingResults) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {note.laboratoryResults && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Laboratorio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap">{note.laboratoryResults}</p>
              </CardContent>
            </Card>
          )}
          {note.imagingResults && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Imagen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap">{note.imagingResults}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Evaluación y Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Evaluación / Impresión Diagnóstica
            </h4>
            <p className="whitespace-pre-wrap pl-6">{note.assessment}</p>
          </div>
          <div className="border-t my-4" />
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Plan Terapéutico
            </h4>
            <p className="whitespace-pre-wrap pl-6">{note.plan}</p>
          </div>
        </CardContent>
      </Card>

      {(note.medications || note.pendingStudies) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {note.medications && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">Medicamentos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap">{note.medications}</p>
              </CardContent>
            </Card>
          )}
          {note.pendingStudies && (
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b pb-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-teal-600" />
                  <CardTitle className="text-lg">Estudios Pendientes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-wrap">{note.pendingStudies}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        Creado: {formatDate(note.createdAt)}
        {note.updatedAt !== note.createdAt && ` | Actualizado: ${formatDate(note.updatedAt)}`}
      </div>
    </div>
  );
}
