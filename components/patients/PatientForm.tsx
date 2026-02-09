"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientSchemaType } from "@/lib/schemas/patientSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, User, Hospital, Activity, Phone, Scan, FileKey } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PatientFormProps
{
  initialData?: Partial<PatientSchemaType> & { id?: string };
  isEditing?: boolean;
}

export function PatientForm({ initialData, isEditing = false }: PatientFormProps)
{
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientSchemaType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      medicalRecordNumber: initialData?.medicalRecordNumber || "",
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split("T")[0] : "",
      gender: (initialData?.gender as "M" | "F" | "O") || "M",
      admissionDate: initialData?.admissionDate
        ? new Date(initialData.admissionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      bedNumber: initialData?.bedNumber || "",
      roomNumber: initialData?.roomNumber || "",
      service: initialData?.service || "",
      diagnosis: initialData?.diagnosis || "",
      allergies: initialData?.allergies || "",
      hospital: initialData?.hospital || "",
      attendingDoctor: initialData?.attendingDoctor || "",
      bloodType: initialData?.bloodType || undefined,
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactPhone: initialData?.emergencyContactPhone || "",
      dietType: initialData?.dietType || "",
      weight: initialData?.weight || undefined,
      height: initialData?.height || undefined,
      specialNotes: initialData?.specialNotes || "",
      isolationPrecautions: initialData?.isolationPrecautions || "",
    },
  });

  async function onSubmit(values: PatientSchemaType)
  {
    setIsSubmitting(true);
    try
    {
      const url = isEditing ? `/api/patients/${initialData?.id}` : "/api/patients";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok)
      {
        throw new Error(data.error?.message || "Ocurrió un error al guardar");
      }

      toast.success(isEditing ? "Paciente actualizado correctamente" : "Paciente registrado con éxito");
      router.push("/patients");
      router.refresh();
    } catch (error)
    {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Error al procesar la solicitud");
    } finally
    {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-lg font-display">Información Personal</CardTitle>
              </div>
              <CardDescription>Datos básicos y demográficos del paciente</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="medicalRecordNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <FileKey className="h-4 w-4 text-muted-foreground" />
                      Número de Historia Clínica (NHC)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 123456" {...field} className="bg-card/50 border-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombres</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan" {...field} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellidos</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Pérez" {...field} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-card/50 border-primary/20">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Sangre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="bg-card/50 border-primary/20">
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <Hospital className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-lg font-display">Detalles de Hospitalización</CardTitle>
              </div>
              <CardDescription>Ubicación y personal responsable</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Ingreso</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bedNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Scan className="h-4 w-4 text-cyan-500" />
                        Cama
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 302-A" {...field} className="bg-card/50 border-primary/20 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habitación</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. 302" {...field} value={field.value || ""} className="bg-card/50 border-primary/20 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="service"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Servicio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Medicina Interna" {...field} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del hospital" {...field} className="bg-card/50 border-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendingDoctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico Tratante (Cargo)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Dr. Mauricio Mora" {...field} className="bg-card/50 border-primary/20" />
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
                <Activity className="h-5 w-5 text-teal-500" />
                <CardTitle className="text-lg font-display">Información Clínica</CardTitle>
              </div>
              <CardDescription>Diagnóstico, alergias y notas médicas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnóstico Principal</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa el diagnóstico de ingreso..."
                        className="min-h-[100px] bg-card/50 border-primary/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Alergias
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Penicilina, Látex (o Ninguna)" {...field} value={field.value || ""} className="bg-card/50 border-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dietType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Dieta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Blanda, Ayuno" {...field} value={field.value || ""} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isolationPrecautions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precauciones</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Contacto, Gotitas" {...field} value={field.value || ""} className="bg-card/50 border-primary/20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Ej. 70.5"
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          value={field.value || ""}
                          className="bg-card/50 border-primary/20 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Talla (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ej. 175"
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                          value={field.value || ""}
                          className="bg-card/50 border-primary/20 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-primary/10">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-teal-500" />
                <CardTitle className="text-lg font-display">Contacto de Emergencia</CardTitle>
              </div>
              <CardDescription>Familiar o persona de referencia</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} value={field.value || ""} className="bg-card/50 border-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. +52 55..." {...field} value={field.value || ""} className="bg-card/50 border-primary/20 font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aseguradora (Institución)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. IMSS, AXA, Particular" {...field} value={field.value || ""} className="bg-card/50 border-primary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Especiales / Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Información relevante no capturada anteriormente..."
                        {...field}
                        value={field.value || ""}
                        className="bg-card/50 border-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
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
                {isEditing ? "Guardar Cambios" : "Registrar Paciente"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
