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
          <h2 className="text-xl font-semibold">
            Revisar Pacientes ({patients.length})
          </h2>
          <p className="text-sm text-muted-foreground">
            {validCount} listos para importar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(patients)}>
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
              className={isValid ? "border-green-200" : "border-yellow-200"}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {patient.firstName || "Sin nombre"} {patient.lastName || ""}
                    </CardTitle>
                    {isValid ? (
                      <Badge variant="default" className="bg-green-500">
                        Válido
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Incompleto</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingIndex(isEditing ? null : index)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePatient(index)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {!isValid && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Faltan datos requeridos</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                      Nombre, apellido y número de cama son obligatorios
                    </p>
                  </div>
                )}

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={patient.firstName || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Apellido</Label>
                      <Input
                        value={patient.lastName || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "lastName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Cama</Label>
                      <Input
                        value={patient.bedNumber || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "bedNumber", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Servicio</Label>
                      <Input
                        value={patient.service || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "service", e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Diagnóstico</Label>
                      <Input
                        value={patient.diagnosis || ""}
                        onChange={(e) =>
                          handleUpdatePatient(index, "diagnosis", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Cama:</span>{" "}
                      <span className="font-medium">{patient.bedNumber || "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Servicio:</span>{" "}
                      <span className="font-medium">{patient.service || "-"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Diagnóstico:</span>{" "}
                      <span className="font-medium">{patient.diagnosis || "-"}</span>
                    </div>
                    {patient.allergies && (
                      <div className="col-span-2">
                        <Badge variant="destructive">
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
