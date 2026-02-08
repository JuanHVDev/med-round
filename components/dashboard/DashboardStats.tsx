"use client";

import * as React from "react";
import {
  Users,
  CheckSquare,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardStatsProps {
  stats: {
    totalPatients: number;
    patientsChange?: number;
    pendingTasks: number;
    tasksChange?: number;
    criticalPatients: number;
    criticalChange?: number;
    notesToday: number;
    notesChange?: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Pacientes Activos",
      value: stats.totalPatients,
      change: stats.patientsChange,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Tareas Pendientes",
      value: stats.pendingTasks,
      change: stats.tasksChange,
      icon: CheckSquare,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Pacientes Críticos",
      value: stats.criticalPatients,
      change: stats.criticalChange,
      icon: AlertCircle,
      color: "text-red-600 bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Notas Hoy",
      value: stats.notesToday,
      change: stats.notesChange,
      icon: FileText,
      color: "text-green-600 bg-green-50 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {card.title}
            </span>
            <div className={cn("p-2 rounded-lg", card.color)}>
              <card.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </div>
            {card.change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {card.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    card.change >= 0 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {card.change >= 0 ? "+" : ""}
                  {card.change}% vs ayer
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
