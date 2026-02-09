/**
 * Componente para previsualizar y editar pacientes extraídos
 *
 * Permite al usuario revisar, editar y corregir datos
 * antes de confirmar la importación
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, X, Edit2 } from "lucide-react";
import type { ExtractedPatient } from "@/services/import/types";
import { cn } from "@/lib/utils";

interface ImportPreviewProps {
  /** Pacientes extraídos por IA */
  patients: ExtractedPatient[];
  /** Callback al confirmar importación */
  onConfirm: (patients: ExtractedPatient[]) => void;
  /** Callback al cancelar */
  onCancel: () => void;
}

/**
 * Componente de previsualización con edición manual
 */
export function ImportPreview({
  patients: initialPatients,
  onConfirm,
  onCancel,
}: ImportPreviewProps) {
  const [patients, setPatients] = useState<ExtractedPatient[]>(initialPatients);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleUpdatePatient = (
    index: number,
    field: keyof ExtractedPatient,
    value: string
  ) => {
    const updated = [...patients];
    updated[index] = { ...updated[index], [field]: value };
    setPatients(updated);
  };

  const handleRemovePatient = (index: number) => {
    setPatients(patients.filter((_, i) => i !== index));
  };

  const isValidPatient = (patient: ExtractedPatient) => {
    return patient.firstName && patient.lastName && patient.bedNumber;
  };

  const validCount = patients.filter(isValidPatient).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold">
            Revisar Pacientes ({patients.length})
          </h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            {validCount} listos para importar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="hover:bg-primary/5">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(patients)} variant="glow">
            <Check className="mr-2 h-4 w-4" />
            Confirmar Importación
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {patients.map((patient, index) => {
          const isValid = isValidPatient(patient);
          const isEditing = editingIndex === index;

          return (
            <Card
              key={index}
              className={cn(
                "transition-all duration-300",
                isValid
                  ? "bg-card/50 border-primary/10"
                  : "bg-card/30 border-orange-500/20"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {patient.firstName || "Sin nombre"} {patient.lastName || ""}
                    </CardTitle>
                    {isValid ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Válido
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-400 border-orange-500/20 gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        Incompleto
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingIndex(isEditing ? null : index)}
                      className="hover:bg-primary/5"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePatient(index)}
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {!isValid && (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Faltan datos requeridos</span>
                    </div>
                    <p className="text-sm text-orange-400/80">
                      Nombre, apellido y número de cama son obligatorios
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-primary/70">Nombre</Label>
                      <Input
                        value={patient.firstName || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "firstName", e.target.value)
                        }
                        className="bg-card/50 border-primary/20 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <Label className="text-primary/70">Apellido</Label>
                      <Input
                        value={patient.lastName || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "lastName", e.target.value)
                        }
                        className="bg-card/50 border-primary/20 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <Label className="text-primary/70">Cama</Label>
                      <Input
                        value={patient.bedNumber || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "bedNumber", e.target.value)
                        }
                        className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-primary/70">Servicio</Label>
                      <Input
                        value={patient.service || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "service", e.target.value)
                        }
                        className="bg-card/50 border-primary/20 focus:border-primary/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-primary/70">Diagnóstico</Label>
                      <Input
                        value={patient.diagnosis || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "diagnosis", e.target.value)
                        }
                        className="bg-card/50 border-primary/20 focus:border-primary/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cama:</span>{" "}
                      <span className="font-mono font-medium">{patient.bedNumber || "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Servicio:</span>{" "}
                      <Badge variant="outline" className="bg-card/50">
                        {patient.service || "-"}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Diagnóstico:</span>{" "}
                      <span className="text-muted-foreground/80">{patient.diagnosis || "-"}</span>
                    </div>
                    {patient.allergies && (
                      <div className="col-span-2">
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-400 border-red-500/20 gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          Alergias: {patient.allergies}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
