/**
 * Tarjeta de paciente para mostrar en listas y grids
 * 
 * Muestra información básica del paciente con enlace a su detalle
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PatientWithRelations } from "@/services/patient/types";

interface PatientCardProps {
  patient: PatientWithRelations;
}

export function PatientCard({ patient }: PatientCardProps) {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();

  return (
    <Link href={`/patients/${patient.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {age} años • {getGenderLabel(patient.gender)}
              </p>
            </div>
            <BedStatusBadge
              bedNumber={patient.bedNumber}
              isActive={patient.isActive}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{patient.service}</Badge>
              {patient.allergies && (
                <Badge variant="destructive">Alergias</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {patient.diagnosis}
            </p>
            <p className="text-xs text-muted-foreground">
              HC: {patient.medicalRecordNumber}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Badge del estado de la cama
 */
function BedStatusBadge({ bedNumber, isActive }: { bedNumber: string; isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      Cama {bedNumber}
    </span>
  );
}

/**
 * Obtiene la etiqueta de género en español
 */
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
