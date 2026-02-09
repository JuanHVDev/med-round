"use client";

import { useEffect, useState, use } from "react";
import { PatientForm } from "@/components/patients/PatientForm";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PatientSchemaType } from "@/lib/schemas/patientSchema";
import { Card } from "@/components/ui/card";

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [initialData, setInitialData] = useState<PatientSchemaType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.patient) {
          const patient = data.patient;
          setInitialData({
            ...patient,
            dateOfBirth: new Date(patient.dateOfBirth).toISOString().split("T")[0],
            admissionDate: new Date(patient.admissionDate).toISOString().split("T")[0],
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
      } catch (error) {
        console.error("Error fetching patient for edit:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Cargando datos del paciente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/patients/${id}`}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">M</span>
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold">Editar Paciente</h1>
                  <p className="text-xs text-muted-foreground">Actualice la información clínica y personal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {initialData && (
          <Card className="bg-card/50 border-primary/10 backdrop-blur-sm p-6">
            <PatientForm initialData={initialData} isEditing={true} />
          </Card>
        )}
      </main>
    </div>
  );
}
