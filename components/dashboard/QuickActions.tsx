"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  FileText,
  FileText as FileTextIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Nuevo Paciente",
    description: "Registrar un nuevo paciente",
    href: "/patients/new",
    icon: Users,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  {
    title: "Nueva Nota SOAP",
    description: "Crear nota clínica",
    href: "/patients/new?action=soap",
    icon: FileText,
    color: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  {
    title: "Nueva Tarea",
    description: "Asignar una tarea",
    href: "/tasks/new",
    icon: CheckSquare,
    color: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  },
  {
    title: "Entrega de Guardia",
    description: "Generar handover",
    href: "/handover/new",
    icon: FileTextIcon,
    color: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.title} href={action.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-auto flex-col items-start gap-2 p-4",
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    "transition-colors"
                  )}
                >
                  <div className={cn("p-2 rounded-lg", action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
