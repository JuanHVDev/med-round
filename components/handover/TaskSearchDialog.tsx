"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle, Clock, X, Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTasks, type Task } from "@/hooks/useTasks";
import type { TaskPriority } from "@/lib/schemas/taskSchema";

interface TaskSearchProps {
  selectedTasks: Task[];
  onSelect: (task: Task) => void;
  onDeselect: (taskId: string) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  HIGH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  URGENT: "bg-red-500/10 text-red-600 border-red-500/20",
};

const priorityIcons: Record<TaskPriority, typeof Clock> = {
  LOW: Clock,
  MEDIUM: Clock,
  HIGH: AlertCircle,
  URGENT: AlertCircle,
};

export function TaskSearch({
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

  const handleSelect = (task: Task) => {
    onSelect(task);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
        <Input
          placeholder="Buscar por título, paciente o número de cama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card/50 border-primary/20 focus:border-primary/50"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-primary/70 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          Tareas Pendientes ({filteredTasks?.length || 0})
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <Card className="bg-card/50 border-primary/10 backdrop-blur-sm max-h-[400px] overflow-y-auto">
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
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200",
                        isSelected
                          ? "bg-green-500/10 border border-green-500/20"
                          : "hover:bg-primary/5 border border-transparent hover:border-primary/20"
                      )}
                      onClick={() => !isSelected && handleSelect(task)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center border",
                            priorityColors[priority]
                          )}
                        >
                          <PriorityIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            {task.patient ? (
                              <>
                                <span className="text-primary/80">
                                  {task.patient.firstName} {task.patient.lastName}
                                </span>
                                <span className="text-primary/40">•</span>
                                <span className="font-mono">Cama {task.patient.bedNumber}</span>
                              </>
                            ) : (
                              "Sin paciente"
                            )}
                            {task.dueDate && (
                              <>
                                <span className="text-primary/40 ml-1">•</span>
                                <span className="text-orange-500/80">
                                  Vence: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {isSelected ? (
                        <div className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckSquare className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plus className="h-4 w-4 text-primary/60" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8 bg-card/30 border border-primary/10 rounded-lg">
            <CheckSquare className="h-10 w-10 mx-auto mb-2 text-primary/30" />
            <p className="font-medium text-primary/60">No hay tareas pendientes</p>
          </div>
        )}
      </div>

      {selectedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary/70 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Tareas incluidas ({selectedTasks.length})
          </p>
          <div className="grid grid-cols-1 gap-2">
            {selectedTasks.map((task) => {
              const priority = task.priority as TaskPriority;
              const PriorityIcon = priorityIcons[priority];
              return (
                <Card key={task.id} className="p-3 bg-card/50 border-primary/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center border",
                          priorityColors[priority]
                        )}
                      >
                        <PriorityIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          {task.patient ? (
                            <span className="text-primary/80">
                              {task.patient.firstName} {task.patient.lastName}
                            </span>
                          ) : (
                            "Sin paciente"
                          )}
                          <Badge
                            variant="outline"
                            className={cn("text-xs px-2 py-0", priorityColors[priority])}
                          >
                            {task.priority}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeselect(task.id)}
                      className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                    >
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
        <div className="text-center py-4 bg-card/30 border border-primary/10 rounded-lg">
          <p className="text-sm text-primary/60">
            Selecciona las tareas que quieres incluir en el handover
          </p>
        </div>
      )}
    </div>
  );
}
