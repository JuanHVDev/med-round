/**
 * Tarjeta de paciente para mostrar en listas y grids
 *
 * Muestra información básica del paciente con enlace a su detalle
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="hover:border-primary/30 transition-all duration-300 cursor-pointer group h-full">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors font-display">
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-primary/5 border-primary/20">
                  {patient.service}
                </Badge>
                {patient.allergies && (
                  <Badge variant="destructive">Alergias</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {patient.diagnosis}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                HC: {patient.medicalRecordNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

/**
 * Badge del estado de la cama
 */
function BedStatusBadge({ bedNumber, isActive }: { bedNumber: string; isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
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
