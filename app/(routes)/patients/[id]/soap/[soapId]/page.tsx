"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SoapNoteView } from "@/components/soap/SoapNoteView";
import { SoapNoteForm } from "@/components/soap/SoapNoteForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import type { SoapNoteWithRelations } from "@/services/soap/types";

export default function SoapNoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id: patientId, soapId } = params as { id: string; soapId: string };

  const [note, setNote] = useState<SoapNoteWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`/api/soap-notes/${soapId}`);
        if (!res.ok) {
          throw new Error("Nota no encontrada");
        }
        const data = await res.json();
        setNote(data.note);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la nota");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNote();
  }, [soapId]);

  const handleSuccess = () => {
    setIsEditing(false);
    router.refresh();
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="text-center py-12">
          <p className="text-red-500">{error || "Nota no encontrada"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al paciente
      </Button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nota SOAP</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <SoapNoteForm
          patientId={patientId}
          initialData={{
            ...note,
            vitalSigns: note.vitalSigns as Record<string, unknown>,
          }}
          isEditing={true}
        />
      ) : (
        <SoapNoteView note={note} />
      )}
    </div>
  );
}
