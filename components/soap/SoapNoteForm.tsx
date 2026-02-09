"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { soapNoteSchema, type SoapNoteSchemaType } from "@/lib/schemas/soapSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save, FileText, ClipboardList, Activity, TestTube, Scan, Pill, Clock, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VitalSignsInput } from "./VitalSignsInput";

interface SoapNoteFormProps {
  patientId: string;
  initialData?: Partial<SoapNoteSchemaType> & { id?: string };
  isEditing?: boolean;
}

export function SoapNoteForm({ patientId, initialData, isEditing = false }: SoapNoteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SoapNoteSchemaType>({
    resolver: zodResolver(soapNoteSchema),
    defaultValues: {
      patientId,
      chiefComplaint: initialData?.chiefComplaint || "",
      historyOfPresentIllness: initialData?.historyOfPresentIllness || "",
      vitalSigns: initialData?.vitalSigns || {},
      physicalExam: initialData?.physicalExam || "",
      laboratoryResults: initialData?.laboratoryResults || undefined,
      imagingResults: initialData?.imagingResults || undefined,
      assessment: initialData?.assessment || "",
      plan: initialData?.plan || "",
      medications: initialData?.medications || undefined,
      pendingStudies: initialData?.pendingStudies || undefined,
    },
  });

  async function onSubmit(values: SoapNoteSchemaType) {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/soap-notes/${initialData?.id}` : "/api/soap-notes";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Ocurrió un error al guardar");
      }

      toast.success(isEditing ? "Nota SOAP actualizada correctamente" : "Nota SOAP creada con éxito");
      router.push(`/patients/${patientId}`);
      router.refresh();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-lg font-display">Nota SOAP</CardTitle>
              </div>
              <CardDescription>
                {isEditing
                  ? "Modifique los datos de la nota SOAP"
                  : "Complete todos los campos para crear una nueva nota SOAP"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4 text-cyan-500" />
                        Motivo de Consulta
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa el motivo de consulta del paciente..."
                          className="min-h-[80px] bg-card/50 border-primary/20"
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="historyOfPresentIllness"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-teal-500" />
                        Historia de la Enfermedad Actual (HPI)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describa la evolución de la enfermedad actual..."
                          className="min-h-[120px] bg-card/50 border-primary/20"
                          maxLength={2000}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <VitalSignsInput />

          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-500" />
                <CardTitle className="text-lg font-display">Exploración Física</CardTitle>
              </div>
              <CardDescription>Hallazgos de la exploración física</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="physicalExam"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Describa los hallazgos de la exploración física..."
                        className="min-h-[150px] bg-card/50 border-primary/20"
                        maxLength={2000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-cyan-500" />
                  <CardTitle className="text-lg font-display">Resultados de Laboratorio</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="laboratoryResults"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Resultados de estudios de laboratorio..."
                          className="min-h-[100px] bg-card/50 border-primary/20"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-teal-500" />
                  <CardTitle className="text-lg font-display">Resultados de Imagen</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="imagingResults"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Resultados de estudios de imagen (RX, US, TAC, etc.)..."
                          className="min-h-[100px] bg-card/50 border-primary/20"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-lg font-display">Evaluación y Plan</CardTitle>
              </div>
              <CardDescription>Impresión diagnóstica y plan terapéutico</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="assessment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evaluación / Impresión Diagnóstica</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa su impresión diagnóstica..."
                        className="min-h-[100px] bg-card/50 border-primary/20"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Terapéutico</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el plan terapéutico..."
                        className="min-h-[100px] bg-card/50 border-primary/20"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-teal-500" />
                  <CardTitle className="text-lg font-display">Medicamentos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Lista de medicamentos prescritos..."
                          className="min-h-[100px] bg-card/50 border-primary/20"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-primary/10">
              <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-500" />
                  <CardTitle className="text-lg font-display">Estudios Pendientes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="pendingStudies"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Estudios o procedimientos pendientes..."
                          className="min-h-[100px] bg-card/50 border-primary/20"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4 border-t border-primary/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="glow"
            className="min-w-[180px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Guardar Cambios" : "Crear Nota SOAP"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
