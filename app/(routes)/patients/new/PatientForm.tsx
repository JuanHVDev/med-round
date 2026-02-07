/**
 * Componente de formulario para crear pacientes
 * 
 * Client Component con validación Zod
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientFormData } from "@/lib/schemas/patientSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface PatientFormProps {
  hospital: string;
}

export function PatientForm({ hospital }: PatientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      hospital: hospital,
      gender: undefined as unknown as "M" | "F" | "O",
      bloodType: undefined as unknown as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, hospital, isActive: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear paciente");
      }

      router.push("/patients");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicalRecordNumber">Número de Historia Clínica *</Label>
              <Input
                id="medicalRecordNumber"
                {...register("medicalRecordNumber")}
                placeholder="Ej: HC-2024-001"
              />
              {errors.medicalRecordNumber && (
                <p className="text-sm text-red-500">{errors.medicalRecordNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Género *</Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value as "M" | "F" | "O")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                  <SelectItem value="O">Otro</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Tipo de Sangre</Label>
              <Select
                value={watch("bloodType")}
                onValueChange={(value: string) => setValue("bloodType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubicación y Servicio</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedNumber">Número de Cama *</Label>
              <Input id="bedNumber" {...register("bedNumber")} placeholder="Ej: 101" />
              {errors.bedNumber && (
                <p className="text-sm text-red-500">{errors.bedNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Número de Habitación</Label>
              <Input id="roomNumber" {...register("roomNumber")} placeholder="Ej: 10-A" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service">Servicio *</Label>
              <Input
                id="service"
                {...register("service")}
                placeholder="Ej: Medicina Interna"
              />
              {errors.service && (
                <p className="text-sm text-red-500">{errors.service.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendingDoctor">Médico Tratante *</Label>
              <Input id="attendingDoctor" {...register("attendingDoctor")} />
              {errors.attendingDoctor && (
                <p className="text-sm text-red-500">{errors.attendingDoctor.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Médica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnóstico Principal *</Label>
              <Textarea
                id="diagnosis"
                {...register("diagnosis")}
                placeholder="Describe el diagnóstico principal del paciente"
                rows={3}
              />
              {errors.diagnosis && (
                <p className="text-sm text-red-500">{errors.diagnosis.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                {...register("allergies")}
                placeholder="Lista las alergias conocidas, separadas por comas"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  {...register("weight", { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  {...register("height", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNotes">Notas Especiales</Label>
              <Textarea
                id="specialNotes"
                {...register("specialNotes")}
                placeholder="Notas adicionales importantes sobre el paciente"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/patients">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Paciente"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
