/**
 * Componente PatientMultiSelect
 *
 * Muestra todos los pacientes activos con checkboxes
 * para seleccionar múltiples pacientes para el handover.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import { Search, Users, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients, type PatientListItem } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";

interface PatientMultiSelectProps {
  hospital: string;
  selectedPatientIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function PatientMultiSelect({
  hospital,
  selectedPatientIds,
  onSelectionChange,
}: PatientMultiSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading } = usePatients({
    hospital,
    limit: 100, // Cargar más pacientes para mostrar todos los activos
  });

  // Filtrar solo pacientes activos y aplicar búsqueda
  const activePatients = data?.patients.filter(
    (patient) => patient.isActive
  ) || [];

  const filteredPatients = searchQuery
    ? activePatients.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.service.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activePatients;

  const handleTogglePatient = (patientId: string) => {
    if (selectedPatientIds.includes(patientId)) {
      onSelectionChange(selectedPatientIds.filter((id) => id !== patientId));
    } else {
      onSelectionChange([...selectedPatientIds, patientId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPatientIds.length === filteredPatients.length) {
      // Deseleccionar todos los visibles
      const visibleIds = new Set(filteredPatients.map((p) => p.id));
      onSelectionChange(selectedPatientIds.filter((id) => !visibleIds.has(id)));
    } else {
      // Seleccionar todos los visibles
      const visibleIds = filteredPatients.map((p) => p.id);
      const newSelection = [...new Set([...selectedPatientIds, ...visibleIds])];
      onSelectionChange(newSelection);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const selectedCount = selectedPatientIds.length;
  const allVisibleSelected =
    filteredPatients.length > 0 &&
    filteredPatients.every((p) => selectedPatientIds.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y contador */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cama o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {activePatients.length} activos
        </Badge>
        <Badge
          variant={selectedCount > 0 ? "default" : "secondary"}
          className="flex items-center gap-1"
        >
          <Check className="h-3 w-3" />
          {selectedCount} seleccionados
        </Badge>
      </div>

      {/* Botón seleccionar todos */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allVisibleSelected}
            onCheckedChange={handleSelectAll}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            {allVisibleSelected
              ? "Deseleccionar todos los visibles"
              : "Seleccionar todos los visibles"}
          </label>
        </div>
      )}

      {/* Grid de pacientes */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">
            {searchQuery
              ? "No se encontraron pacientes con ese criterio"
              : "No hay pacientes activos"}
          </p>
          {searchQuery && (
            <p className="text-sm mt-1">
              Intenta con otro término de búsqueda
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-1">
          {filteredPatients.map((patient) => {
            const isSelected = selectedPatientIds.includes(patient.id);
            return (
              <Card
                key={patient.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-border hover:border-blue-300"
                )}
                onClick={() => handleTogglePatient(patient.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleTogglePatient(patient.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold truncate">
                          Cama {patient.bedNumber}
                        </p>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {patient.service}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      {patient.diagnosis && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {patient.diagnosis}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
