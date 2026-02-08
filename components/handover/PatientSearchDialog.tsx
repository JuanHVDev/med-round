/**
 * Componente PatientSearchDialog
 *
 * Panel de búsqueda de pacientes integrado en el flujo del HandoverBuilder
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import { Search, Loader2, User, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatients, type PatientListItem } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";

interface PatientSearchDialogProps {
  hospital: string;
  selectedPatients: PatientListItem[];
  onSelect: (patient: PatientListItem) => void;
  onDeselect: (patientId: string) => void;
}

export function PatientSearchDialog({
  hospital,
  selectedPatients,
  onSelect,
  onDeselect,
}: PatientSearchDialogProps) {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data, isLoading } = usePatients({
    hospital,
    search: search || undefined,
    limit: 20,
  });

  const filteredPatients = data?.patients.filter(
    (p) => !selectedPatients.some((sp) => sp.id === p.id)
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, cama o número de historia..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-9 pr-9"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {showResults && search && (
        <Card className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPatients && filteredPatients.length > 0 ? (
            <div className="divide-y">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer transition-colors",
                    "hover:bg-blue-50"
                  )}
                  onClick={() => {
                    onSelect(patient);
                    setSearch("");
                    setShowResults(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cama {patient.bedNumber} • {patient.service}
                      </p>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron pacientes</p>
            </div>
          )}
        </Card>
      )}

      {selectedPatients.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Pacientes seleccionados ({selectedPatients.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedPatients.map((patient) => (
              <Card key={patient.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cama {patient.bedNumber}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeselect(patient.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
