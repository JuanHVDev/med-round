"use client";

import { PatientForm } from "@/components/patients/PatientForm";
import { Hospital, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewPatientPage()
{
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/patients">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Hospital className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Registrar Nuevo Paciente</h1>
                  <p className="text-xs text-slate-500 font-medium">Complete la ficha de ingreso hospitalario</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PatientForm />
      </main>
    </div>
  );
}
