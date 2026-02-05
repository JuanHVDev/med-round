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
import { Plus, Upload } from "lucide-react";
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
        <PatientSearch onSearch={handleSearch} onClear={handleClear} />
        <div className="flex gap-2">
          <Link href="/patients/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </Link>
          <Link href="/patients/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo
            </Button>
          </Link>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <EmptyState
          title="No se encontraron pacientes"
          description="Intenta con otros términos de búsqueda o agrega un nuevo paciente"
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredPatients.length} de {total} pacientes
          </p>
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
