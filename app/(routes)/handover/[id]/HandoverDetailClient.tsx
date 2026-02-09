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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHandover, useHandoverById } from "@/hooks/useHandover";
import { HandoverSummary } from "@/components/handover/HandoverSummary";
import { GeneratePDFButton } from "@/components/handover/GeneratePDFButton";
import type { HandoverWithRelations, PatientHandoverInfo, TaskHandoverInfo, CriticalPatientInfo } from "@/services/handover/types";
import { cn } from "@/lib/utils";

interface HandoverDetailClientProps {
  handover: HandoverWithRelations;
  patients: PatientHandoverInfo[];
}

export function HandoverDetailClient({ handover: initialHandover, patients }: HandoverDetailClientProps) {
  const router = useRouter();
  const [localHandover, setLocalHandover] = useState<HandoverWithRelations>(initialHandover);
  const { data: handoverData, isLoading } = useHandoverById(initialHandover.id);
  const { finalizeHandover, isFinalizing } = useHandover({ hospital: initialHandover.hospital });

  // Usar datos del servidor si están disponibles, sino usar estado local
  const currentHandover = handoverData?.handover || localHandover;

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
        return (
          <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/5">
            <Clock className="h-3 w-3 text-primary" />
            Borrador
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1">
            <AlertTriangle className="h-3 w-3" />
            En Progreso
          </Badge>
        );
      case "FINALIZED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
            <CheckCircle className="h-3 w-3" />
            Finalizado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleFinalize = async () => {
    try {
      const result = await finalizeHandover(initialHandover.id);
      // Actualizar estado local inmediatamente para reflejar el cambio
      if (result?.handover) {
        setLocalHandover(result.handover);
      }
    } catch (error) {
      console.error("Error finalizando handover:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  const criticalPatients = (currentHandover.criticalPatients as CriticalPatientInfo[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/handover">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-semibold">{currentHandover.service}</h2>
              {getStatusBadge(currentHandover.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="text-primary/60">{currentHandover.shiftType}</span>
              <span className="text-primary/30">•</span>
              <span className="font-mono text-sm">{formatDate(currentHandover.shiftDate)}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentHandover.status !== "FINALIZED" && (
            <Button onClick={handleFinalize} disabled={isFinalizing} variant="glow">
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

      <Card className="bg-card/50 border-primary/10 backdrop-blur-sm">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent h-auto p-0 gap-2">
            <TabsTrigger
              value="summary"
              className={cn(
                "px-4 py-2 border-b-2 -mb-px transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary"
              )}
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className={cn(
                "px-4 py-2 border-b-2 -mb-px transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary"
              )}
            >
              Pacientes ({currentHandover.includedPatientIds.length})
            </TabsTrigger>
            <TabsTrigger
              value="critical"
              className={cn(
                "px-4 py-2 border-b-2 -mb-px transition-colors rounded-none data-[state=active]:border-primary data-[state=active]:text-primary"
              )}
            >
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
              Críticos ({criticalPatients.length})
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="summary">
              <HandoverSummary
                handover={currentHandover}
                criticalPatients={criticalPatients}
              />
            </TabsContent>

            <TabsContent value="patients">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                  <Card key={patient.id} className="bg-card/50 border-primary/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="font-mono text-primary">{patient.bedNumber}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <span>{patient.firstName} {patient.lastName}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">HC:</span>{" "}
                        <span className="font-mono">{patient.medicalRecordNumber}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Dx:</span>{" "}
                        {patient.diagnosis}
                      </p>
                      {patient.allergies && (
                        <p className="text-sm text-red-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {patient.allergies}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {patients.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground bg-card/30 border border-primary/10 rounded-lg">
                    No hay pacientes incluidos
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="critical">
              {criticalPatients.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {criticalPatients.map((patient) => (
                    <Card key={patient.patientId} className="bg-red-500/5 border-red-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <span className="font-mono">{patient.bedNumber}</span>
                        </CardTitle>
                        <CardDescription>{patient.patientName}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-red-400/80 mb-2">{patient.reason}</p>
                        <p className="text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Tareas pendientes:</span>{" "}
                          <Badge variant="outline" className="bg-red-500/10 border-red-500/20">
                            {patient.pendingTasksCount}
                          </Badge>
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center bg-card/30 border border-primary/10 rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-primary/30" />
                    <p className="text-muted-foreground">No hay pacientes críticos</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
