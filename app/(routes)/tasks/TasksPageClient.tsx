"use client";

import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskFilters, type FilterState } from "@/components/tasks/TaskFilters";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTasks, useUpdateTask } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { TaskStatus } from "@/lib/schemas/taskSchema";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
});

interface TasksPageClientProps {
  assignedTo: string;
  hospital: string;
}

function TasksPageContent({ assignedTo, hospital }: TasksPageClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    priority: "",
    search: "",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: tasks = [], isLoading, error } = useTasks(filters);
  const updateTaskMutation = useUpdateTask();

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: { status: TaskStatus }) => {
    await updateTaskMutation.mutateAsync({ id: taskId, data: updates });
  }, [updateTaskMutation]);

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-destructive">Error al cargar las tareas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Tareas</h1>
          <p className="text-muted-foreground">
            Gestiona las tareas del turno en {hospital}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} variant="glow">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      <TaskFilters onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskClick={(task) => {
            console.log("Task clicked:", task.id);
          }}
        />
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-primary/20">
            <div className="p-6">
              <h2 className="text-xl font-display font-semibold mb-4">Nueva Tarea</h2>
              <TaskForm
                onClose={() => setShowCreateForm(false)}
                assignedTo={assignedTo}
                hospital={hospital}
              />
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export function TasksPageClient({ assignedTo, hospital }: TasksPageClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TasksPageContent assignedTo={assignedTo} hospital={hospital} />
    </QueryClientProvider>
  );
}
