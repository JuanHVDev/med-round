"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "./PriorityBadge";
import { Calendar, User } from "lucide-react";
import type { TaskWithRelations } from "@/services/tasks/types";

interface TaskCardProps {
  task: TaskWithRelations;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary-500",
        "touch-none"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
          {task.title}
        </h3>
        <PriorityBadge variant={task.priority} />
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {task.patient && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>
              {task.patient.firstName} {task.patient.lastName} ({task.patient.bedNumber})
            </span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>

      {task.assignee && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                {task.assignee.fullName.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {task.assignee.fullName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
