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
import { Plus, Users, ClipboardList, CheckCircle, ArrowRight, ArrowLeft, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useHandover } from "@/hooks/useHandover";
import { usePatients, type PatientListItem } from "@/hooks/usePatients";
import type { Task as TaskType } from "@/hooks/useTasks";
import { CriticalPatientCard } from "./CriticalPatientCard";
import { PatientMultiSelect } from "./PatientMultiSelect";
import { TaskSearch } from "./TaskSearchDialog";
import { MedRoundLogo } from "@/components/ui/med-round-logo";
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

export function HandoverBuilder({ hospital }: HandoverBuilderProps) {
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
    isCreating,
  } = useHandover({ hospital });

  const { data: patientsData } = usePatients({ hospital, limit: 100 });
  
  const selectedPatients = patientsData?.patients.filter(
    (patient) => formData.includedPatientIds.includes(patient.id)
  ) || [];
  const [selectedTasks, setSelectedTasks] = useState<TaskType[]>([]);
  const [criticalPatients, setCriticalPatients] = useState<CriticalPatientInfo[]>([]);

  const steps = [
    { id: "info", label: "Información", icon: FileText },
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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Label htmlFor="service" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Servicio
          </Label>
          <Input
            id="service"
            placeholder="Ej: Urgencias, planta, UCI..."
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="bg-card/50 border-primary/20 focus:border-primary/50"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="shiftType" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Tipo de Turno
          </Label>
          <Select
            value={formData.shiftType}
            onValueChange={(value) =>
              setFormData({ ...formData, shiftType: value as "MORNING" | "AFTERNOON" | "NIGHT" })
            }
          >
            <SelectTrigger className="bg-card/50 border-primary/20 focus:border-primary/50">
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

        <div className="space-y-3">
          <Label htmlFor="shiftDate" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Fecha del Turno
          </Label>
          <Input
            id="shiftDate"
            type="date"
            value={formData.shiftDate}
            onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
            className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="startTime" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Hora de Inicio
          </Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="bg-card/50 border-primary/20 focus:border-primary/50 font-mono"
          />
        </div>
      </div>
    </div>
  );

  const renderStepPatients = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-display flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Seleccionar Pacientes
        </h3>
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
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 font-display">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
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
    <div className="space-y-5">
      <h3 className="text-lg font-semibold font-display flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-primary" />
        Buscar y Seleccionar Tareas
      </h3>

      <TaskSearch
        selectedTasks={selectedTasks}
        onSelect={handleSelectTask}
        onDeselect={handleDeselectTask}
      />
    </div>
  );

  const renderStepNotes = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <Label htmlFor="generalNotes" className="flex items-center gap-2 font-display">
          <FileText className="h-4 w-4 text-primary" />
          Notas Generales del Turno
        </Label>
        <Textarea
          id="generalNotes"
          className="w-full min-h-[200px] p-4 bg-card/50 border-primary/20 focus:border-primary/50 resize-none font-mono"
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
    <div className="space-y-5">
      <Card className="bg-card/50 border-primary/10">
        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <CardTitle className="font-display">Resumen del Handover</CardTitle>
          </div>
          <CardDescription>Revisa la información antes de finalizar</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">

            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground font-display">Servicio</p>
              <p className="font-semibold font-mono">{formData.service || "No especificado"}</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground font-display">Turno</p>
              <p className="font-semibold font-mono">
                {shiftTypes.find((s) => s.value === formData.shiftType)?.label || "No especificado"}
              </p>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground font-display">Fecha</p>
              <p className="font-semibold font-mono">{formData.shiftDate}</p>
            </div>
            <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/10">
              <p className="text-xs text-muted-foreground font-display">Pacientes</p>
              <p className="font-semibold font-mono text-cyan-600">{selectedPatients.length}</p>
            </div>
            <div className="p-3 bg-teal-500/5 rounded-lg border border-teal-500/10">
              <p className="text-xs text-muted-foreground font-display">Tareas</p>
              <p className="font-semibold font-mono text-teal-600">{selectedTasks.length}</p>
            </div>
          </div>

          {selectedTasks.length > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-xs text-muted-foreground mb-2 font-display">Tareas Incluidas</p>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {selectedTasks.slice(0, 5).map((task) => (
                  <p key={task.id} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {task.title}
                    {task.patient && (
                      <span className="text-muted-foreground font-mono text-xs">
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

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-muted-foreground mb-2 font-display">Notas</p>
            <p className="text-sm font-mono">{formData.generalNotes || "Sin notas adicionales"}</p>
          </div>

          {criticalPatients.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {criticalPatients.length} paciente(s) crítico(s) detectado(s)
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
        const hasService = formData.service.length > 0;
        const hasShiftType = formData.shiftType.length > 0;
        return hasService && hasShiftType;
      case "patients":
      case "tasks":
      case "notes":
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
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            <MedRoundLogo size="sm" />
            Nueva Entrega de Guardia
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">Hospital: {hospital}</p>
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
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  isActive && "bg-primary/10 text-primary border-2 border-primary/30 shadow-lg shadow-primary/5",
                  isCompleted && "bg-primary/5 text-primary border-2 border-primary/20",
                  !isActive && !isCompleted && "bg-muted/50 text-muted-foreground"
                )}
              >
                <StepIcon className="h-4 w-4" />
                <span className="hidden sm:inline font-display">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-primary/30 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <Card className="bg-card/50 border-primary/10">
        <CardContent className="pt-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-primary/10 pt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === "info"}
          className="gap-2 border-primary/20 hover:bg-primary/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        {currentStep === "review" ? (
          <Button
            onClick={handleCreateHandover}
            disabled={isCreating}
            variant="glow"
            className="gap-2"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Finalizar Handover
          </Button>
        ) : (
          <Button onClick={nextStep} disabled={!isCurrentStepValid()} variant="glow" className="gap-2">
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
