"use client";

import { useEffect, useState, useCallback } from "react";
import { PatientTable } from "@/components/patients/PatientTable";
import { PatientSearchFilters } from "@/components/patients/PatientSearchFilters";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Loader2, Hospital } from "lucide-react";
import Link from "next/link";
import type { PatientWithRelations } from "@/services/patient/types";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PatientsPage()
{
  const { session } = useAuth();
  const [patients, setPatients] = useState<PatientWithRelations[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [currentHospital, setCurrentHospital] = useState("Cargando...");

  const fetchPatients = useCallback(async () =>
  {
    try
    {
      setLoading(true);
      const res = await fetch("/api/patients");
      const data = await res.json();

      if (data.patients)
      {
        setPatients(data.patients);
        setFilteredPatients(data.patients);

        // Extraer servicios únicos
        const uniqueServices = Array.from(
          new Set(data.patients.map((p: PatientWithRelations) => p.service))
        ) as string[];
        setServices(uniqueServices);
        if (data.hospital)
        {
          setCurrentHospital(data.hospital);
        }
      }
    } catch (error)
    {
      console.error("Error fetching patients:", error);
    } finally
    {
      setLoading(false);
    }
  }, []);

  useEffect(() =>
  {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() =>
  {
    let result = patients;

    if (searchQuery)
    {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query) ||
          p.medicalRecordNumber.toLowerCase().includes(query)
      );
    }

    if (selectedService !== "all")
    {
      result = result.filter((p) => p.service === selectedService);
    }

    setFilteredPatients(result);
  }, [searchQuery, selectedService, patients]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Hospital className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Censo de Pacientes</h1>
                <p className="text-xs text-slate-500 font-medium">
                  {session?.user?.name || "Médico"} | {currentHospital}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/patients/import">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Importar Censo</span>
                </Button>
              </Link>
              <Link href="/patients/new">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Paciente</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PatientSearchFilters
          services={services}
          onSearchChange={setSearchQuery}
          onServiceChange={setSelectedService}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-medium animate-pulse">Cargando censo...</p>
          </div>
        ) : (
          <PatientTable
            patients={filteredPatients}
            onAction={(action, patient) =>
            {
              console.log(`Action: ${action} for patient: ${patient.firstName}`);
              // Aquí se implementarán las navegaciones a SOAP, Tareas, etc.
            }}
          />
        )}
      </main>
    </div>
  );
}
