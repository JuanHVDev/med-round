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
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
    borderColor: "border-gray-200 dark:border-gray-700",
  },
  IN_PROGRESS: {
    title: "En Progreso",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  COMPLETED: {
    title: "Completadas",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
  },
  CANCELLED: {
    title: "Canceladas",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
};

export function TaskColumn({ id, tasks, onTaskClick }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const config = columnConfigs[id];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border-2 p-4 min-h-[500px] transition-colors",
        config.bgColor,
        config.borderColor,
        isOver && "ring-2 ring-primary-500 ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          {config.title}
        </h2>
        <span className="flex items-center justify-center h-6 px-2 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
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
            <div className="flex items-center justify-center flex-1 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              Sin tareas
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
