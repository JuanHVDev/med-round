"use client";

import { useEffect, useState, use } from "react";
import { PatientForm } from "@/components/patients/PatientForm";
import { Hospital, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PatientSchemaType } from "@/lib/schemas/patientSchema";

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> })
{
  const { id } = use(params);
  const [initialData, setInitialData] = useState<PatientSchemaType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>
  {
    async function fetchPatient()
    {
      try
      {
        const res = await fetch(`/api/patients/${id}`);
        const data = await res.json();
        if (data.patient)
        {
          // Transformar fechas a strings ISO para el formulario
          const patient = data.patient;
          setInitialData({
            ...patient,
            dateOfBirth: new Date(patient.dateOfBirth).toISOString().split("T")[0],
            admissionDate: new Date(patient.admissionDate).toISOString().split("T")[0],
            // Asegurarse de que los campos numéricos sean tratados correctamente
            weight: patient.weight || undefined,
            height: patient.height || undefined,
            roomNumber: patient.roomNumber || undefined,
            allergies: patient.allergies || undefined,
            bloodType: patient.bloodType || undefined,
            emergencyContactName: patient.emergencyContactName || undefined,
            emergencyContactPhone: patient.emergencyContactPhone || undefined,
            insuranceProvider: patient.insuranceProvider || undefined,
            insuranceNumber: patient.insuranceNumber || undefined,
            specialNotes: patient.specialNotes || undefined,
            dietType: patient.dietType || undefined,
            isolationPrecautions: patient.isolationPrecautions || undefined,
          });
        }
      } catch (error)
      {
        console.error("Error fetching patient for edit:", error);
      } finally
      {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  if (loading)
  {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Cargando datos del paciente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/patients/${id}`}>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Hospital className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Editar Paciente</h1>
                  <p className="text-xs text-slate-500 font-medium">Actualice la información clínica y personal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {initialData && (
          <PatientForm initialData={initialData} isEditing={true} />
        )}
      </main>
    </div>
  );
}
