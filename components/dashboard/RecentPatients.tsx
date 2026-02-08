"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatInitials } from "@/lib/utils/formatting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Patient {
  id: string;
  name: string;
  bedNumber: number;
  lastVisit?: Date;
  condition?: string;
}

interface RecentPatientsProps {
  patients: Patient[];
}

export function RecentPatients({ patients }: RecentPatientsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Pacientes Recientes</CardTitle>
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="gap-1">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No hay pacientes registrados</p>
            <Link href="/patients/new">
              <Button variant="outline" size="sm" className="mt-3">
                Registrar Paciente
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  "transition-colors cursor-pointer"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {formatInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {patient.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Cama {patient.bedNumber}
                    {patient.condition && ` • ${patient.condition}`}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {patient.lastVisit
                    ? new Date(patient.lastVisit).toLocaleDateString("es-ES")
                    : "Sin visitas"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
