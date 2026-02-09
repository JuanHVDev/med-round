"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Activity, AlertTriangle, Phone, FileText, Plus } from "lucide-react";
import { SoapNoteList } from "@/components/soap";
import type { SoapNoteWithRelations } from "@/services/soap/types";
import { cn } from "@/lib/utils";

interface PatientDetailClientProps {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    medicalRecordNumber: string;
    dateOfBirth: string;
    gender: string;
    admissionDate: string;
    service: string;
    bedNumber: string;
    roomNumber: string | null;
    diagnosis: string;
    allergies: string | null;
    specialNotes: string | null;
    bloodType: string | null;
    attendingDoctor: string;
    hospital: string;
    insuranceProvider: string | null;
    insuranceNumber: string | null;
    weight: number | null;
    height: number | null;
    dietType: string | null;
    isolationPrecautions: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    isActive: boolean;
    soapNotes?: SoapNoteWithRelations[];
  };
}

export function PatientDetailClient({ patient }: PatientDetailClientProps) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const admissionDate = new Date(patient.admissionDate).toLocaleDateString("es-ES");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Link href="/patients">
        <Button variant="ghost" className="mb-6 hover:bg-primary/5">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pacientes
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-display">
                    {patient.firstName} {patient.lastName}
                  </CardTitle>
                  <p className="text-muted-foreground font-mono text-sm">
                    HC: {patient.medicalRecordNumber}
                  </p>
                </div>
                <Badge
                  variant={patient.isActive ? "default" : "secondary"}
                  className={cn(
                    "gap-1",
                    patient.isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {patient.isActive ? "Activo" : "Alta"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={<User className="h-4 w-4 text-primary" />}
                  label="Edad"
                  value={`${age} años`}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4 text-primary" />}
                  label="Género"
                  value={getGenderLabel(patient.gender)}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4 text-primary" />}
                  label="Fecha de ingreso"
                  value={admissionDate}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4 text-primary" />}
                  label="Servicio"
                  value={patient.service}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4 text-primary" />}
                  label="Cama"
                  value={patient.bedNumber}
                />
                {patient.roomNumber && (
                  <InfoItem
                    icon={<Activity className="h-4 w-4 text-primary" />}
                    label="Habitación"
                    value={patient.roomNumber}
                  />
                )}
              </div>

              <hr className="my-6 border-primary/10" />

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Diagnóstico Principal
                  </h4>
                  <p className="text-muted-foreground">{patient.diagnosis}</p>
                </div>

                {patient.allergies && (
                  <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-400">Alergias</h4>
                      <p className="text-red-400/80">{patient.allergies}</p>
                    </div>
                  </div>
                )}

                {patient.specialNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Notas Especiales</h4>
                    <p className="text-muted-foreground">{patient.specialNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Notas SOAP ({patient.soapNotes?.length || 0})
                </CardTitle>
                <Link href={`/patients/${patient.id}/soap/new`}>
                  <Button size="sm" variant="glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Nota
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <SoapNoteList
                notes={patient.soapNotes || []}
                patientId={patient.id}
                onCreateNew={() => window.location.href = `/patients/${patient.id}/soap/new`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.bloodType && (
                <InfoItem
                  icon={<Activity className="h-4 w-4 text-primary" />}
                  label="Tipo de sangre"
                  value={patient.bloodType}
                />
              )}
              <InfoItem
                icon={<User className="h-4 w-4 text-primary" />}
                label="Médico tratante"
                value={patient.attendingDoctor}
              />
              <InfoItem
                icon={<Activity className="h-4 w-4 text-primary" />}
                label="Hospital"
                value={patient.hospital}
              />

              {patient.insuranceProvider && (
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Seguro</p>
                  <p className="font-medium">{patient.insuranceProvider}</p>
                  {patient.insuranceNumber && (
                    <p className="text-sm text-muted-foreground">
                      Póliza: {patient.insuranceNumber}
                    </p>
                  )}
                </div>
              )}

              {patient.weight && patient.height && (
                <InfoItem
                  icon={<Activity className="h-4 w-4 text-primary" />}
                  label="Medidas"
                  value={`${patient.weight}kg / ${patient.height}cm`}
                />
              )}

              {patient.dietType && (
                <InfoItem
                  icon={<Activity className="h-4 w-4 text-primary" />}
                  label="Dieta"
                  value={patient.dietType}
                />
              )}

              {patient.isolationPrecautions && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-sm font-medium text-orange-400">Precauciones</p>
                  <p className="text-sm text-orange-400/80">{patient.isolationPrecautions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {patient.emergencyContactName && (
            <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary/60" />
                  <span>{patient.emergencyContactName}</span>
                </div>
                {patient.emergencyContactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary/60" />
                    <span className="font-mono">{patient.emergencyContactPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-primary/60 mt-0.5">{icon}</span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function getGenderLabel(gender: string): string {
  switch (gender) {
    case "M":
      return "Masculino";
    case "F":
      return "Femenino";
    case "O":
      return "Otro";
    default:
      return gender;
  }
}
