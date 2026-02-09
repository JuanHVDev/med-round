"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import type { TaskWithRelations, TaskStatus } from "@/services/tasks/types";

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: TaskWithRelations[];
  onTaskClick?: (task: TaskWithRelations) => void;
}

const columnConfigs = {
  PENDING: {
    title: "Pendientes",
    bgColor: "bg-card",
    borderColor: "border-amber-500/20",
    accentColor: "text-amber-400",
    dotColor: "bg-amber-500",
  },
  IN_PROGRESS: {
    title: "En Progreso",
    bgColor: "bg-card",
    borderColor: "border-cyan-500/20",
    accentColor: "text-cyan-400",
    dotColor: "bg-cyan-500",
  },
  COMPLETED: {
    title: "Completadas",
    bgColor: "bg-card",
    borderColor: "border-emerald-500/20",
    accentColor: "text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  CANCELLED: {
    title: "Canceladas",
    bgColor: "bg-card",
    borderColor: "border-red-500/20",
    accentColor: "text-red-400",
    dotColor: "bg-red-500",
  },
};

export function TaskColumn({ id, tasks, onTaskClick }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const config = columnConfigs[id];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border p-4 min-h-[500px] transition-all duration-300",
        config.bgColor,
        config.borderColor,
        isOver && "ring-2 ring-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
          <h2 className="font-semibold font-display">
            {config.title}
          </h2>
        </div>
        <span className={cn(
          "flex items-center justify-center h-6 px-3 text-xs font-medium rounded-full",
          "bg-primary/10 text-primary"
        )}>
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3 flex-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}

          {tasks.length === 0 && (
            <div className={cn(
              "flex items-center justify-center flex-1 text-sm border-2 border-dashed rounded-lg",
              "border-primary/20 text-muted-foreground"
            )}>
              Sin tareas
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
