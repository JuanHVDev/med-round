"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./PriorityBadge";
import { PatientSelector } from "@/components/patients/PatientSelector";

const taskFormSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200, "Título muy largo"),
  description: z.string().max(1000, "Descripción muy larga").optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  type: z.enum(["LABORATORY", "IMAGING", "CONSULT", "PROCEDURE", "MEDICATION", "OTHER"]),
  patientId: z.string().optional().nullable(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onClose?: () => void;
  defaultPatientId?: string;
  assignedTo: string;
  hospital: string;
}

const taskTypes = [
  { value: "LABORATORY", label: "Laboratorio" },
  { value: "IMAGING", label: "Imagen" },
  { value: "CONSULT", label: "Consulta" },
  { value: "PROCEDURE", label: "Procedimiento" },
  { value: "MEDICATION", label: "Medicación" },
  { value: "OTHER", label: "Otro" },
];

const priorities = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export function TaskForm({ onClose, defaultPatientId, assignedTo, hospital }: TaskFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      type: "OTHER",
      patientId: defaultPatientId || null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          assignedTo,
          hospital,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Error al crear tarea");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Tarea creada correctamente");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      form.reset();
      onClose?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título
        </label>
        <Input
          {...form.register("title")}
          placeholder="Ej: Ordenar biometría hemática"
        />
        {form.formState.errors.title && (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <Textarea
          {...form.register("description")}
          placeholder="Detalles adicionales..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value as TaskFormData["priority"])}
            >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <PriorityBadge variant={p.value as "LOW" | "MEDIUM" | "HIGH" | "URGENT"} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
            <Select
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as TaskFormData["type"])}
            >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {taskTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Paciente (opcional)
        </label>
        <PatientSelector
          value={form.watch("patientId") || null}
          onChange={(val) => form.setValue("patientId", val || null)}
          hospital={hospital}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear Tarea"}
        </Button>
      </div>
    </form>
  );
}
