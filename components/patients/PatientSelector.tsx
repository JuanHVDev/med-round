"use client";

import { useState, useCallback, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bed } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  bedNumber: string;
  diagnosis?: string;
}

interface PatientSelectorProps {
  value: string | null;
  onChange: (patientId: string | null) => void;
  hospital: string;
}

export function PatientSelector({ value, onChange, hospital }: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPatients = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        hospital,
        search: query,
        isActive: "true",
        limit: "50",
      });
      const response = await fetch(`/api/patients?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, [hospital]);

  useEffect(() => {
    fetchPatients("");
  }, [fetchPatients]);

  const selectedPatient = patients.find((p) => p.id === value);

  return (
    <div className="relative">
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val === "" ? null : val)}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4" />
            <SelectValue placeholder="Seleccionar paciente por cama" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <input
              type="text"
              placeholder="Buscar por número de cama o nombre..."
              className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Cargando...
            </div>
          ) : patients.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No hay pacientes activos
            </div>
          ) : (
            patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-[60px]">{patient.bedNumber}</span>
                  <span className="truncate">
                    {patient.firstName} {patient.lastName}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {selectedPatient && (
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
          <span>
            {selectedPatient.firstName} {selectedPatient.lastName}
            {selectedPatient.diagnosis && ` - ${selectedPatient.diagnosis}`}
          </span>
        </div>
      )}
    </div>
  );
}
