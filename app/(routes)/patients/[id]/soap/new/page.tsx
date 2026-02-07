"use client";

import { useParams } from "next/navigation";
import { SoapNoteForm } from "@/components/soap/SoapNoteForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewSoapNotePage() {
  const params = useParams();
  const patientId = params.id as string;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => window.history.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al paciente
      </Button>

      <h1 className="text-2xl font-bold mb-6">Nueva Nota SOAP</h1>

      <SoapNoteForm patientId={patientId} />
    </div>
  );
}
