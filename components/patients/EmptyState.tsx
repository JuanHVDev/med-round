/**
 * Componente para mostrar estado vacío
 * 
 * Se muestra cuando no hay pacientes o resultados de búsqueda
 */

"use client";

import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

export function EmptyState({
  title = "No hay pacientes registrados",
  description = "Comienza agregando el primer paciente al censo",
  showAddButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {showAddButton && (
        <Link href="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Paciente
          </Button>
        </Link>
      )}
    </div>
  );
}
