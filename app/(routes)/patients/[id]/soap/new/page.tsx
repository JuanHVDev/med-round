"use client";

import { useParams } from "next/navigation";
import { SoapNoteForm } from "@/components/soap/SoapNoteForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function NewSoapNotePage() {
  const params = useParams();
  const patientId = params.id as string;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href={`/patients/${patientId}`}>
        <Button variant="ghost" className="mb-6 hover:bg-primary/5">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al paciente
        </Button>
      </Link>

      <Card className="bg-card/50 border border-primary/10 backdrop-blur-sm p-6">
        <h1 className="text-2xl font-display font-bold mb-6">Nueva Nota SOAP</h1>
        <SoapNoteForm patientId={patientId} />
      </Card>
    </div>
  );
}
