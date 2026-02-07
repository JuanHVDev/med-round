/**
 * Página de detalle de paciente
 *
 * Muestra información completa del paciente con sus notas SOAP y tareas
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientService } from "@/services/patient/patientService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Activity, AlertTriangle, Phone, FileText, Plus } from "lucide-react";

interface PatientDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getPatient(id: string) {
  const patientService = new PatientService(prisma);
  const result = await patientService.getByIdWithRelations(id);

  if (!result.success) {
    return null;
  }

  return result.patient;
}

export default async function PatientDetailPage({ params }: PatientDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>No autenticado</p>
      </div>
    );
  }

  const { id } = await params;
  const patient = await getPatient(id);

  if (!patient) {
    notFound();
  }

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const admissionDate = new Date(patient.admissionDate).toLocaleDateString("es-ES");

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Link href="/patients">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pacientes
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {patient.firstName} {patient.lastName}
                  </CardTitle>
                  <p className="text-muted-foreground">HC: {patient.medicalRecordNumber}</p>
                </div>
                <Badge variant={patient.isActive ? "default" : "secondary"}>
                  {patient.isActive ? "Activo" : "Alta"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label="Edad"
                  value={`${age} años`}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Género"
                  value={getGenderLabel(patient.gender)}
                />
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha de ingreso"
                  value={admissionDate}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Servicio"
                  value={patient.service}
                />
                <InfoItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Cama"
                  value={patient.bedNumber}
                />
                {patient.roomNumber && (
                  <InfoItem
                    icon={<Activity className="h-4 w-4" />}
                    label="Habitación"
                    value={patient.roomNumber}
                  />
                )}
              </div>

              <hr className="my-6 border-gray-200" />

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Diagnóstico Principal</h4>
                  <p className="text-muted-foreground">{patient.diagnosis}</p>
                </div>

                {patient.allergies && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-700">Alergias</h4>
                      <p className="text-red-600">{patient.allergies}</p>
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

{patient.soapNotes && patient.soapNotes.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notas SOAP ({patient.soapNotes.length})
                  </CardTitle>
                  <Link href={`/patients/${patient.id}/soap/new`}>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva Nota
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.soapNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/patients/${patient.id}/soap/${note.id}`}
                      className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.date).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      <p className="font-medium">{note.chiefComplaint}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas SOAP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No hay notas SOAP registradas</p>
                  <Link href={`/patients/${patient.id}/soap/new`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primera Nota SOAP
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.bloodType && (
                <InfoItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Tipo de sangre"
                  value={patient.bloodType}
                />
              )}
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Médico tratante"
                value={patient.attendingDoctor}
              />
              <InfoItem
                icon={<Activity className="h-4 w-4" />}
                label="Hospital"
                value={patient.hospital}
              />

              {patient.insuranceProvider && (
                <div>
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
                  icon={<Activity className="h-4 w-4" />}
                  label="Medidas"
                  value={`${patient.weight}kg / ${patient.height}cm`}
                />
              )}

              {patient.dietType && (
                <InfoItem
                  icon={<Activity className="h-4 w-4" />}
                  label="Dieta"
                  value={patient.dietType}
                />
              )}

              {patient.isolationPrecautions && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-700">Precauciones</p>
                  <p className="text-sm text-yellow-600">{patient.isolationPrecautions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {patient.emergencyContactName && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{patient.emergencyContactName}</span>
                </div>
                {patient.emergencyContactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.emergencyContactPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {patient.tasks && patient.tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tareas Pendientes ({patient.tasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span className="text-sm">{task.title}</span>
                      <Badge variant={getStatusVariant(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
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
      <span className="text-muted-foreground mt-0.5">{icon}</span>
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

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "IN_PROGRESS":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "IN_PROGRESS":
      return "En progreso";
    case "COMPLETED":
      return "Completada";
    case "CANCELLED":
      return "Cancelada";
    default:
      return status;
  }
}
