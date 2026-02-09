/**
 * Componente para mostrar estado vacío
 * 
 * Se muestra cuando no hay pacientes o resultados de búsqueda
 */

"use client";

import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
  icon?: ReactNode;
}

export function EmptyState({
  title = "No hay pacientes registrados",
  description = "Comienza agregando el primer paciente al censo",
  showAddButton = true,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        {icon ? icon : <Users className="h-8 w-8 text-primary" />}
      </div>
      <h3 className="text-lg font-semibold mb-2 font-display">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {showAddButton && (
        <Link href="/patients/new">
          <Button variant="glow">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Paciente
          </Button>
        </Link>
      )}
    </div>
  );
}
