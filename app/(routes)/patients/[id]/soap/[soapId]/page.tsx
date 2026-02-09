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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
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
        <div className="text-center py-12 bg-card/50 border border-primary/10 rounded-xl backdrop-blur-sm">
          <p className="text-red-500">{error || "Nota no encontrada"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-primary/5">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al paciente
        </Button>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="glow">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="bg-card/50 border border-primary/10 rounded-xl backdrop-blur-sm p-6">
        <h1 className="text-2xl font-display font-bold mb-6">Nota SOAP</h1>

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
    </div>
  );
}
