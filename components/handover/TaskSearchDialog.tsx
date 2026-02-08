/**
 * Componente TaskSearch
 *
 * Panel para buscar y seleccionar tareas pendientes
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, Clock, X, Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTasks, type TaskWithRelations } from "@/hooks/useTasks";
import type { TaskPriority } from "@/lib/schemas/taskSchema";

interface TaskSearchProps {
  hospital: string;
  selectedTasks: TaskWithRelations[];
  onSelect: (task: TaskWithRelations) => void;
  onDeselect: (taskId: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const priorityIcons: Record<TaskPriority, typeof Clock> = {
  LOW: Clock,
  MEDIUM: Clock,
  HIGH: AlertCircle,
  URGENT: AlertCircle,
};

export function TaskSearch({
  hospital,
  selectedTasks,
  onSelect,
  onDeselect,
}: TaskSearchProps) {
  const [search, setSearch] = useState("");

  const { data: allTasks, isLoading } = useTasks({
    status: "PENDING",
  });

  const filteredTasks = allTasks?.filter(
    (task) =>
      !selectedTasks.some((st) => st.id === task.id) &&
      (task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.patient?.firstName.toLowerCase().includes(search.toLowerCase()) ||
        task.patient?.lastName.toLowerCase().includes(search.toLowerCase()) ||
        task.patient?.bedNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (task: TaskWithRelations) => {
    onSelect(task);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, paciente o número de cama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Tareas Pendientes ({filteredTasks?.length || 0})
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <Card className="max-h-[400px] overflow-y-auto">
            <CardContent className="p-2">
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const priority = task.priority as TaskPriority;
                  const PriorityIcon = priorityIcons[priority];
                  const isSelected = selectedTasks.some((st) => st.id === task.id);
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                        isSelected ? "bg-green-50" : "hover:bg-blue-50"
                      )}
                      onClick={() => !isSelected && handleSelect(task)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center",
                            priorityColors[priority]
                          )}
                        >
                          <PriorityIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.patient
                              ? `${task.patient.firstName} ${task.patient.lastName} (Cama ${task.patient.bedNumber})`
                              : "Sin paciente"}
                            {task.dueDate && (
                              <span className="ml-2">
                                • Vence: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-green-600" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
            <CheckSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No hay tareas pendientes</p>
          </div>
        )}
      </div>

      {selectedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Tareas incluidas ({selectedTasks.length})
          </p>
          <div className="grid grid-cols-1 gap-2">
            {selectedTasks.map((task) => {
              const priority = task.priority as TaskPriority;
              const PriorityIcon = priorityIcons[priority];
              return (
                <Card key={task.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          priorityColors[priority]
                        )}
                      >
                        <PriorityIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {task.patient
                            ? `${task.patient.firstName} ${task.patient.lastName}`
                            : "Sin paciente"}
                          <span
                            className={cn(
                              "ml-2 px-2 py-0.5 rounded text-xs",
                              priorityColors[priority]
                            )}
                          >
                            {task.priority}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => onDeselect(task.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {selectedTasks.length === 0 && (
        <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
          <p className="text-sm">
            Selecciona las tareas que quieres incluir en el handover
          </p>
        </div>
      )}
    </div>
  );
}
