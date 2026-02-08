/**
 * Componente HandoverDetailClient
 *
 * Cliente para ver y gestionar un handover existente.
 * Permite finalizar, editar y descargar PDF.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, Edit, FileDown, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHandover, useHandoverById } from "@/hooks/useHandover";
import { HandoverSummary } from "@/components/handover/HandoverSummary";
import { GeneratePDFButton } from "@/components/handover/GeneratePDFButton";
import type { HandoverWithRelations, PatientHandoverInfo, TaskHandoverInfo, CriticalPatientInfo } from "@/services/handover/types";

interface HandoverDetailClientProps {
  handover: HandoverWithRelations;
  patients: PatientHandoverInfo[];
}

export function HandoverDetailClient({ handover: initialHandover, patients }: HandoverDetailClientProps) {
  const router = useRouter();
  const { data: handoverData, isLoading } = useHandoverById(initialHandover.id);
  const { finalizeHandover, isFinalizing } = useHandover({ hospital: initialHandover.hospital });
  const [activeTab, setActiveTab] = useState<"summary" | "patients" | "critical">("summary");
  const [isEditing, setIsEditing] = useState(false);

  const currentHandover = handoverData?.handover || initialHandover;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Borrador</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800 gap-1"><AlertTriangle className="h-3 w-3" /> En Progreso</Badge>;
      case "FINALIZED":
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle className="h-3 w-3" /> Finalizado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeHandover(initialHandover.id);
      router.push("/handover");
    } catch (error) {
      console.error("Error finalizando handover:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const criticalPatients = (currentHandover.criticalPatients as CriticalPatientInfo[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{currentHandover.service}</h2>
              {getStatusBadge(currentHandover.status)}
            </div>
            <p className="text-muted-foreground">
              {currentHandover.shiftType} | {formatDate(currentHandover.shiftDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentHandover.status !== "FINALIZED" && (
            <Button onClick={handleFinalize} disabled={isFinalizing}>
              {isFinalizing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Finalizar Handover
            </Button>
          )}
          {currentHandover.status === "FINALIZED" && (
            <GeneratePDFButton
              handover={currentHandover}
              patients={patients}
              tasks={[]}
              criticalPatients={criticalPatients}
            />
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "summary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "patients"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pacientes ({currentHandover.includedPatientIds.length})
          </button>
          <button
            onClick={() => setActiveTab("critical")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "critical"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Críticos ({criticalPatients.length})
          </button>
        </div>

        <div className="mt-4">
          {activeTab === "summary" && (
            <HandoverSummary
              handover={currentHandover}
              criticalPatients={criticalPatients}
            />
          )}

          {activeTab === "patients" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <Card key={patient.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cama {patient.bedNumber}</CardTitle>
                    <CardDescription>{patient.firstName} {patient.lastName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm"><strong>NHC:</strong> {patient.medicalRecordNumber}</p>
                    <p className="text-sm"><strong>Diagnóstico:</strong> {patient.diagnosis}</p>
                    {patient.allergies && (
                      <p className="text-sm text-red-600"><strong>Alergias:</strong> {patient.allergies}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {patients.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No hay pacientes incluidos
                </p>
              )}
            </div>
          )}

          {activeTab === "critical" && (
            criticalPatients.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {criticalPatients.map((patient) => (
                  <Card key={patient.patientId} className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-red-500">⚠️</span>
                        Cama {patient.bedNumber}
                      </CardTitle>
                      <CardDescription>{patient.patientName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700">{patient.reason}</p>
                      <p className="text-sm mt-2">
                        <strong>Tareas pendientes:</strong> {patient.pendingTasksCount}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No hay pacientes críticos</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}
