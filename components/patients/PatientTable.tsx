"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  FileText,
  CheckSquare,
  Clock,
  User
} from "lucide-react";
import type { PatientWithRelations } from "@/services/patient/types";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PatientTableProps
{
  patients: PatientWithRelations[];
  onAction?: (action: string, patient: PatientWithRelations) => void;
}

export function PatientTable({ patients, onAction }: PatientTableProps)
{
  return (
    <div className="rounded-lg border border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-primary/5 border-b border-primary/10">
          <TableRow>
            <TableHead className="w-[80px] font-display">Cama</TableHead>
            <TableHead className="font-display">Paciente</TableHead>
            <TableHead className="hidden md:table-cell font-display">Diagnóstico</TableHead>
            <TableHead className="hidden lg:table-cell font-display">Ingreso</TableHead>
            <TableHead className="font-display">Tratante</TableHead>
            <TableHead className="text-right font-display">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                No hay pacientes activos en el censo.
              </TableCell>
            </TableRow>
          ) : (
            patients.map((patient, index) => (
              <TableRow key={patient.id || `pending-${patient.medicalRecordNumber || index}`} className="hover:bg-primary/5 transition-colors">
                <TableCell className="font-bold text-cyan-600 font-mono">
                  {patient.bedNumber}
                </TableCell>
                <TableCell>
                  <Link href={`/patients/${patient.id}`} className="flex flex-col hover:text-cyan-600 transition-colors">
                    <span className="font-medium text-foreground capitalize font-display">
                      {patient.firstName} {patient.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      HC: {patient.medicalRecordNumber}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate group" title={patient.diagnosis}>
                  <div className="flex flex-col">
                    <span className="text-sm truncate">{patient.diagnosis}</span>
                    {patient.allergies && (
                      <Badge variant="destructive" className="w-fit scale-75 -ml-2 py-0 gap-1">
                        <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                        Alergias
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(patient.admissionDate), "dd MMM, HH:mm", { locale: es })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Dr. {patient.attendingDoctor.split(" ")[0]}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/patients/${patient.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Editar" className="hover:bg-primary/10">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Notas SOAP"
                      onClick={() => onAction?.("soap", patient)}
                      className="hover:bg-cyan-500/10"
                    >
                      <FileText className="h-4 w-4 text-cyan-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Tareas"
                      onClick={() => onAction?.("tasks", patient)}
                      className="hover:bg-teal-500/10"
                    >
                      <CheckSquare className="h-4 w-4 text-teal-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
