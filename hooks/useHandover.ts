/**
 * Hook para gestión de Handover (Entrega de Guardia)
 *
 * Este hook proporciona funcionalidades CRUD para handovers usando
 * TanStack Query, incluyendo:
 * - Listado de handovers con filtros
 * - Creación de nuevos handovers
 * - Actualización (agregar pacientes, tareas)
 * - Finalización con generación de resumen
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type {
  HandoverWithRelations,
  CreateHandoverInput,
  UpdateHandoverInput,
  HandoverFilters,
  CriticalPatientInfo,
  PatientHandoverInfo,
  TaskHandoverInfo,
} from "@/services/handover/types";

interface UseHandoverOptions {
  hospital?: string;
  status?: "DRAFT" | "IN_PROGRESS" | "FINALIZED";
}

interface CreateHandoverResponse {
  handover: HandoverWithRelations;
}

interface ListHandoverResponse {
  handovers: HandoverWithRelations[];
  total: number;
  page: number;
  limit: number;
}

interface FinalizeHandoverResponse {
  handover: HandoverWithRelations;
  message: string;
}

export function useHandover(options: UseHandoverOptions = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const queryKey = ["handovers", options];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<ListHandoverResponse> => {
      const params = new URLSearchParams();
      if (options.hospital) params.set("hospital", options.hospital);
      if (options.status) params.set("status", options.status);

      const response = await fetch(`/api/handover?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        console.error("Error loading handovers:", response.status, errorData);
        throw new Error(errorData.error || `Error ${response.status}: Error al cargar handovers`);
      }
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateHandoverInput): Promise<CreateHandoverResponse> => {
      const response = await fetch("/api/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear handover");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handovers"] });
      toast.success("Handover creado correctamente");
      router.push("/handover");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateHandoverInput;
    }): Promise<{ handover: HandoverWithRelations }> => {
      const response = await fetch(`/api/handover/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar handover");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handovers"] });
      toast.success("Handover actualizado");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async (id: string): Promise<FinalizeHandoverResponse> => {
      const response = await fetch(`/api/handover/${id}/finalize`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al finalizar handover");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handovers"] });
      toast.success("Handover finalizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    handovers: query.data?.handovers ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createHandover: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateHandover: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    finalizeHandover: finalizeMutation.mutateAsync,
    isFinalizing: finalizeMutation.isPending,
    refetch: query.refetch,
  };
}

export function useHandoverById(id: string | undefined) {
  return useQuery({
    queryKey: ["handover", id],
    queryFn: async (): Promise<{ handover: HandoverWithRelations }> => {
      if (!id) throw new Error("ID requerido");
      const response = await fetch(`/api/handover/${id}`);
      if (!response.ok) {
        throw new Error("Error al cargar handover");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCriticalPatients(patientIds: string[]) {
  return useQuery({
    queryKey: ["criticalPatients", patientIds],
    queryFn: async (): Promise<CriticalPatientInfo[]> => {
      if (patientIds.length === 0) return [];
      const response = await fetch("/api/handover/critical-patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientIds }),
      });
      if (!response.ok) {
        throw new Error("Error al detectar pacientes críticos");
      }
      return response.json();
    },
    enabled: patientIds.length > 0,
  });
}
