"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
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
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileDrag={{ scale: 1.05 }}
      className={cn(
        "bg-card rounded-xl shadow-sm border border-primary/10 p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200",
        isDragging && "opacity-60 shadow-xl ring-2 ring-primary",
        "touch-none"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-medium text-foreground line-clamp-2 font-display">
          {task.title}
        </h3>
        <PriorityBadge variant={task.priority} />
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
        <div className="mt-3 pt-3 border-t border-primary/10">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {task.assignee.fullName.charAt(0)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {task.assignee.fullName}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
