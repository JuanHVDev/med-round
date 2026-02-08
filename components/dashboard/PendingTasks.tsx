"use client";

import * as React from "react";
import Link from "next/link";
import { CheckSquare, ArrowRight, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  priority: "urgente" | "alta" | "media" | "baja";
  patientName: string;
  patientId: string;
  dueDate?: Date;
  priorityLabel?: string;
}

interface PendingTasksProps {
  tasks: Task[];
}

const priorityConfig = {
  urgente: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
  alta: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: AlertCircle },
  media: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  baja: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Clock },
};

export function PendingTasks({ tasks }: PendingTasksProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { urgente: 0, alta: 1, media: 2, baja: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Tareas Pendientes</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1">
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckSquare className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No hay tareas pendientes</p>
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="mt-3">
                Ir a Tareas
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.slice(0, 5).map((task) => {
              const config = priorityConfig[task.priority];
              const Icon = config.icon;

              return (
                <Link
                  key={task.id}
                  href={`/tasks?taskId=${task.id}`}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg",
                    "hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    "transition-colors cursor-pointer"
                  )}
                >
                  <div className={cn("p-1.5 rounded mt-0.5", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {task.patientName}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", config.color)}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
