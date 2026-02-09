"use client";

import { useState } from "react";
import { Search, Loader2, User, X, Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
        <Input
          placeholder="Buscar por nombre, cama o número de historia..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-9 pr-9 bg-card/50 border-primary/20 focus:border-primary/50"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-primary"
          >
            <X className="h-4 w-4 text-primary/50" />
          </button>
        )}
      </div>

      {showResults && search && (
        <Card className="bg-card/50 border-primary/10 backdrop-blur-sm max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
            </div>
          ) : filteredPatients && filteredPatients.length > 0 ? (
            <div className="divide-y divide-primary/10">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={cn(
                    "flex items-center justify-between p-3 cursor-pointer transition-all duration-200",
                    "hover:bg-primary/5 border border-transparent hover:border-primary/20"
                  )}
                  onClick={() => {
                    onSelect(patient);
                    setSearch("");
                    setShowResults(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-mono text-primary/70">Cama {patient.bedNumber}</span>
                        <span className="text-primary/30">•</span>
                        <Badge variant="outline" className="text-xs px-2 py-0 bg-card/50">
                          {patient.service}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="h-8 w-8 mx-auto mb-2 text-primary/30" />
              <p className="text-sm text-primary/60">No se encontraron pacientes</p>
            </div>
          )}
        </Card>
      )}

      {selectedPatients.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary/70 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Pacientes seleccionados ({selectedPatients.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedPatients.map((patient) => (
              <Card key={patient.id} className="p-3 bg-card/50 border-primary/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-primary/20 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="font-mono text-primary/70">Cama {patient.bedNumber}</span>
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          {patient.service}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeselect(patient.id)}
                    className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
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
