/**
 * Componente para listar pacientes
 * 
 * Muestra un grid de PatientCard con filtros de búsqueda
 */

"use client";

import { useState } from "react";
import { PatientCard } from "./PatientCard";
import { PatientSearch } from "./PatientSearch";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users } from "lucide-react";
import Link from "next/link";
import type { PatientWithRelations } from "@/services/patient/types";

interface PatientListProps {
  initialPatients: PatientWithRelations[];
  total: number;
}

export function PatientList({ initialPatients, total }: PatientListProps) {
  const [patients] = useState(initialPatients);
  const [filteredPatients, setFilteredPatients] = useState(initialPatients);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(lowerQuery) ||
        patient.lastName.toLowerCase().includes(lowerQuery) ||
        patient.bedNumber.toLowerCase().includes(lowerQuery) ||
        patient.diagnosis.toLowerCase().includes(lowerQuery) ||
        patient.medicalRecordNumber.toLowerCase().includes(lowerQuery)
    );
    setFilteredPatients(filtered);
  };

  const handleClear = () => {
    setFilteredPatients(patients);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-auto">
          <PatientSearch onSearch={handleSearch} onClear={handleClear} />
        </div>
        <div className="flex gap-3">
          <Link href="/patients/import">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </Link>
          <Link href="/patients/new">
            <Button variant="glow" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          </Link>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
          title="No se encontraron pacientes"
          description="Intenta con otros términos de búsqueda o agrega un nuevo paciente"
        />
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Mostrando {filteredPatients.length} de {total} pacientes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
