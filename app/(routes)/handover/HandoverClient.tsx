/**
 * Componente HandoverClient
 *
 * Componente cliente para la lista de handovers.
 * Maneja la interacción con filtros y lista de handovers.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHandover } from "@/hooks/useHandover";
import { cn } from "@/lib/utils";

interface HandoverClientProps {
  hospital: string;
  createdBy: string;
}

export function HandoverClient({ hospital, createdBy }: HandoverClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { handovers, isLoading, isError, error, refetch } = useHandover({
    // Mostrar todos los handovers del usuario sin filtrar por estado inicialmente
    // El hospital del perfil puede ser "Otro" mientras que el handover tiene el nombre real
    createdBy,
  });

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
          <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-400">
            <Clock className="h-3 w-3" />
            Borrador
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="gap-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <AlertTriangle className="h-3 w-3" />
            En Progreso
          </Badge>
        );
      case "FINALIZED":
        return (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" />
            Finalizado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold">Handovers Recientes</h2>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          // Refetch con el nuevo filtro aplicado
          refetch();
        }}>
          <SelectTrigger className="w-[180px] bg-card">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="DRAFT">Borrador</SelectItem>
            <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
            <SelectItem value="FINALIZED">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-lg font-medium text-destructive">Error al cargar handovers</p>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : handovers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">No hay handovers</p>
            <p className="text-muted-foreground mb-4">
              Crea tu primer handover para gestionar la entrega de guardia
            </p>
            <Link href="/handover/new">
              <Button variant="glow">
                <FileText className="h-4 w-4 mr-2" />
                Crear Handover
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {handovers.map((handover, index) => (
            <Link key={handover.id} href={`/handover/${handover.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className="hover:border-primary/30 transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-lg font-display">
                          {handover.service} - {handover.shiftType}
                        </CardTitle>
                      </div>
                      {getStatusBadge(handover.status)}
                    </div>
                    <CardDescription>
                      {formatDate(handover.shiftDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                          {handover.includedPatientIds.length}
                        </span>
                        pacientes
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-foreground">
                          {handover.includedTaskIds.length}
                        </span>
                        tareas
                      </div>
                      {handover.criticalPatients && (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">
                            {handover.criticalPatients.length}
                          </span>
                          críticos
                        </div>
                      )}
                      <div className="ml-auto font-mono text-xs text-muted-foreground">
                        v{handover.version}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
