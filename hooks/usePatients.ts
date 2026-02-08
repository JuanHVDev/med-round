/**
 * Hook para gestión de Pacientes
 *
 * Proporciona funcionalidades para listar y buscar pacientes
 * usando TanStack Query.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useQuery } from "@tanstack/react-query";

export interface PatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  bedNumber: string;
  service: string;
  diagnosis: string | null;
  admissionDate: Date;
  isActive: boolean;
}

interface ListPatientsResponse {
  patients: PatientListItem[];
  total: number;
  page: number;
  limit: number;
}

interface UsePatientsOptions {
  hospital: string;
  search?: string;
  service?: string;
  page?: number;
  limit?: number;
}

export function usePatients(options: UsePatientsOptions) {
  return useQuery({
    queryKey: ["patients", options],
    queryFn: async (): Promise<ListPatientsResponse> => {
      const params = new URLSearchParams();
      params.set("hospital", options.hospital);
      if (options.search) params.set("search", options.search);
      if (options.service) params.set("service", options.service);
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));

      const response = await fetch(`/api/patients?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Error al cargar pacientes");
      }
      return response.json();
    },
    staleTime: 30000,
  });
}
