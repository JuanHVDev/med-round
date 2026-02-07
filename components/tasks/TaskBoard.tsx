"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import type { TaskWithRelations, TaskStatus } from "@/services/tasks/types";

interface TaskBoardProps {
  tasks: TaskWithRelations[];
  onTaskUpdate: (taskId: string, updates: { status: TaskStatus }) => Promise<void>;
  onTaskClick?: (task: TaskWithRelations) => void;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: "PENDING", title: "Pendientes" },
  { id: "IN_PROGRESS", title: "En Progreso" },
  { id: "COMPLETED", title: "Completadas" },
  { id: "CANCELLED", title: "Canceladas" },
];

export function TaskBoard({ tasks, onTaskUpdate, onTaskClick }: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return;
    }

    if (task.status === newStatus) {
      return;
    }

    await onTaskUpdate(taskId, { status: newStatus });
    toast.success("Tarea movida correctamente");
  }, [tasks, onTaskUpdate]);

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      {typeof window !== "undefined" && createPortal(
        <DragOverlay>
          {activeTask && (
            <div className="opacity-80 rotate-3 cursor-grabbing">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
