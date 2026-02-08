/**
 * Componente HandoverBuilder
 *
 * Constructor paso a paso para crear un handover.
 * Permite seleccionar pacientes, agregar tareas y notas,
 * y finalizar con generación automática de resumen.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, ClipboardList, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useHandover } from "@/hooks/useHandover";
import { usePatients, type PatientListItem } from "@/hooks/usePatients";
import { useTasks } from "@/hooks/useTasks";
import type { Task as TaskType } from "@/hooks/useTasks";
import { CriticalPatientCard } from "./CriticalPatientCard";
import { PatientSearchDialog } from "./PatientSearchDialog";
import { PatientMultiSelect } from "./PatientMultiSelect";
import { TaskSearch } from "./TaskSearchDialog";
import { HandoverSummary } from "./HandoverSummary";
import { GeneratePDFButton } from "./GeneratePDFButton";
import type { CriticalPatientInfo } from "@/services/handover/types";

type Step = "info" | "patients" | "tasks" | "notes" | "review";

const shiftTypes = [
  { value: "MORNING", label: "Mañana (08:00 - 15:00)" },
  { value: "AFTERNOON", label: "Tarde (15:00 - 22:00)" },
  { value: "NIGHT", label: "Noche (22:00 - 08:00)" },
];

interface HandoverBuilderProps {
  hospital: string;
  existingHandoverId?: string;
}

export function HandoverBuilder({ hospital, existingHandoverId }: HandoverBuilderProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("info");
  const [formData, setFormData] = useState({
    service: "",
    shiftType: "" as "MORNING" | "AFTERNOON" | "NIGHT" | "",
    shiftDate: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    includedPatientIds: [] as string[],
    includedTaskIds: [] as string[],
    generalNotes: "",
  });

  const {
    createHandover,
    updateHandover,
    finalizeHandover,
    isCreating,
    isUpdating,
    isFinalizing,
  } = useHandover({ hospital });

  const { data: patientsData } = usePatients({ hospital, limit: 100 });
  
  // Computar selectedPatients basado en los datos disponibles
  const selectedPatients = patientsData?.patients.filter(
    (patient) => formData.includedPatientIds.includes(patient.id)
  ) || [];
  const [selectedTasks, setSelectedTasks] = useState<TaskType[]>([]);
  const [criticalPatients, setCriticalPatients] = useState<CriticalPatientInfo[]>([]);

  const steps = [
    { id: "info", label: "Información del Turno", icon: ClipboardList },
    { id: "patients", label: "Pacientes", icon: Users },
    { id: "tasks", label: "Tareas", icon: ClipboardList },
    { id: "notes", label: "Notas", icon: CheckCircle },
    { id: "review", label: "Revisión", icon: CheckCircle },
  ];

  const nextStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id as Step);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex((s) => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as Step);
    }
  };

  const handleSelectTask = (task: TaskType) => {
    if (!selectedTasks.some((t) => t.id === task.id)) {
      setSelectedTasks((prev) => [...prev, task]);
      setFormData({
        ...formData,
        includedTaskIds: [...formData.includedTaskIds, task.id],
      });
    }
  };

  const handleDeselectTask = (taskId: string) => {
    setSelectedTasks((prev) => prev.filter((t) => t.id !== taskId));
    setFormData({
      ...formData,
      includedTaskIds: formData.includedTaskIds.filter((id) => id !== taskId),
    });
  };

  const handleCreateHandover = async () => {
    try {
      const result = await createHandover({
        hospital,
        service: formData.service,
        shiftType: formData.shiftType as "MORNING" | "AFTERNOON" | "NIGHT",
        shiftDate: formData.shiftDate,
        startTime: `${formData.shiftDate}T${formData.startTime}:00`,
      });

      if (result.handover) {
        await updateHandover({
          id: result.handover.id,
          data: {
            includedPatientIds: formData.includedPatientIds,
            includedTaskIds: formData.includedTaskIds,
            generalNotes: formData.generalNotes || undefined,
          },
        });
        router.push(`/handover/${result.handover.id}`);
      }
    } catch (error) {
      console.error("Error creando handover:", error);
    }
  };

  const renderStepInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service">Servicio</Label>
          <Input
            id="service"
            placeholder="Ej: Urgencias, planta, UCI..."
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shiftType">Tipo de Turno</Label>
          <Select
            value={formData.shiftType}
            onValueChange={(value) =>
              setFormData({ ...formData, shiftType: value as "MORNING" | "AFTERNOON" | "NIGHT" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar turno" />
            </SelectTrigger>
            <SelectContent>
              {shiftTypes.map((shift) => (
                <SelectItem key={shift.value} value={shift.value}>
                  {shift.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shiftDate">Fecha del Turno</Label>
          <Input
            id="shiftDate"
            type="date"
            value={formData.shiftDate}
            onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Hora de Inicio</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderStepPatients = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Seleccionar Pacientes</h3>
        <p className="text-sm text-muted-foreground">
          Marca los pacientes que quieres incluir en este handover
        </p>
      </div>

      <PatientMultiSelect
        hospital={hospital}
        selectedPatientIds={formData.includedPatientIds}
        onSelectionChange={(selectedIds) => {
          setFormData({ ...formData, includedPatientIds: selectedIds });
        }}
      />

      {criticalPatients.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            Pacientes Críticos Detectados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalPatients.map((patient) => (
              <CriticalPatientCard key={patient.patientId} patient={patient} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStepTasks = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Buscar y Seleccionar Tareas</h3>

      <TaskSearch
        hospital={hospital}
        selectedTasks={selectedTasks}
        onSelect={handleSelectTask}
        onDeselect={handleDeselectTask}
      />
    </div>
  );

  const renderStepNotes = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="generalNotes">Notas Generales del Turno</Label>
        <textarea
          id="generalNotes"
          className="w-full min-h-[200px] p-3 border rounded-lg resize-none"
          placeholder="Escribe aquí cualquier información relevante para el próximo turno..."
          value={formData.generalNotes}
          onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Incluye información relevante que no esté cubierta por las notas SOAP de los pacientes
        </p>
      </div>
    </div>
  );

  const renderStepReview = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Handover</CardTitle>
          <CardDescription>Revisa la información antes de finalizar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Servicio</p>
              <p className="font-semibold">{formData.service || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Turno</p>
              <p className="font-semibold">
                {shiftTypes.find((s) => s.value === formData.shiftType)?.label || "No especificado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha</p>
              <p className="font-semibold">{formData.shiftDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pacientes</p>
              <p className="font-semibold">{selectedPatients.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tareas</p>
              <p className="font-semibold">{selectedTasks.length}</p>
            </div>
          </div>

          {selectedTasks.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Tareas Incluidas</p>
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {selectedTasks.slice(0, 5).map((task) => (
                  <p key={task.id} className="text-sm">
                    • {task.title}
                    {task.patient && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({task.patient.firstName} {task.patient.lastName})
                      </span>
                    )}
                  </p>
                ))}
                {selectedTasks.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    + {selectedTasks.length - 5} más...
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Notas</p>
            <p className="text-sm">{formData.generalNotes || "Sin notas adicionales"}</p>
          </div>

          {criticalPatients.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">
                ⚠️ {criticalPatients.length} paciente(s) crítico(s) detectado(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "info":
        return renderStepInfo();
      case "patients":
        return renderStepPatients();
      case "tasks":
        return renderStepTasks();
      case "notes":
        return renderStepNotes();
      case "review":
        return renderStepReview();
      default:
        return null;
    }
  };

  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case "info":
        return formData.service.length > 0 && formData.shiftType.length > 0;
      case "patients":
        return true;
      case "tasks":
        return true;
      case "notes":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nueva Entrega de Guardia</h1>
          <p className="text-muted-foreground">Hospital: {hospital}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive && "bg-blue-100 text-blue-800",
                  isCompleted && "bg-green-100 text-green-800",
                  !isActive && !isCompleted && "bg-gray-100 text-gray-600"
                )}
              >
                <StepIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === "info"}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentStep === "review" ? (
          <Button
            onClick={handleCreateHandover}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Finalizar Handover
          </Button>
        ) : (
          <Button onClick={nextStep} disabled={!isCurrentStepValid()}>
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
