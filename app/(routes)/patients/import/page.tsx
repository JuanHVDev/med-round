/**
 * Página de importación de pacientes
 *
 * Flujo:
 * 1. Usuario sube archivo (CSV, PDF, imagen)
 * 2. Backend procesa con IA (Google Gemini)
 * 3. Se muestra preview con datos extraídos
 * 4. Usuario revisa/edita los datos
 * 5. Confirmación crea pacientes en DB
 */

"use client";

import { useState } from "react";
import { FileUploader } from "@/components/patients/import/FileUploader";
import { ImportPreview } from "@/components/patients/import/ImportPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { ExtractedPatient } from "@/services/import/types";

/**
 * Estados del flujo de importación
 */
type ImportState =
  | "upload" // Subir archivo
  | "processing" // Procesando con IA
  | "preview" // Mostrar preview
  | "importing" // Creando pacientes
  | "success"; // Completado

export default function ImportPage() {
  const [state, setState] = useState<ImportState>("upload");
  const [error, setError] = useState<string | null>(null);
  const [extractedPatients, setExtractedPatients] = useState<ExtractedPatient[]>([]);

  /**
   * Maneja la selección de archivo
   */
  const handleFileSelected = async (file: File) => {
    setState("processing");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/patients/import", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar archivo");
      }

      setExtractedPatients(data.patients);
      setState("preview");
    } catch (err) {
      setError((err as Error).message);
      setState("upload");
    }
  };

  /**
   * Confirma la importación y crea pacientes
   */
  const handleConfirm = async (patients: ExtractedPatient[]) => {
    setState("importing");

    try {
      const response = await fetch("/api/patients/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ patients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al importar pacientes");
      }

      setExtractedPatients(data.created);
      setState("success");
    } catch (err) {
      setError((err as Error).message);
      setState("preview");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <Link href="/patients">
          <Button variant="ghost" className="mb-4 hover:bg-primary/5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pacientes
          </Button>
        </Link>
        <h1 className="text-3xl font-display font-bold mb-2">Importar Pacientes</h1>
        <p className="text-muted-foreground">
          Sube un archivo CSV, PDF o imagen. La IA extraerá automáticamente la información.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          {error}
        </Alert>
      )}

      {state === "upload" && (
        <Card className="p-6 bg-card/50 border-primary/10 backdrop-blur-sm">
          <FileUploader
            onFileSelected={handleFileSelected}
            isProcessing={false}
          />
        </Card>
      )}

      {state === "processing" && (
        <Card className="p-12 text-center bg-card/50 border-primary/10 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Procesando con IA...
          </h3>
          <p className="text-muted-foreground">
            Esto puede tomar unos segundos
          </p>
        </Card>
      )}

      {state === "preview" && (
        <ImportPreview
          patients={extractedPatients}
          onConfirm={handleConfirm}
          onCancel={() => setState("upload")}
        />
      )}

      {state === "importing" && (
        <Card className="p-12 text-center bg-card/50 border-primary/10 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Importando pacientes...
          </h3>
          <p className="text-muted-foreground">
            Creando {extractedPatients.length} pacientes en el sistema
          </p>
        </Card>
      )}

      {state === "success" && (
        <Card className="p-12 text-center bg-card/50 border-primary/10 backdrop-blur-sm">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-display font-bold mb-2">¡Importación Exitosa!</h3>
          <p className="text-muted-foreground mb-6">
            Se han importado {extractedPatients.length} pacientes correctamente
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/patients">
              <Button variant="glow">Ver Pacientes</Button>
            </Link>
            <Button variant="outline" onClick={() => setState("upload")}>
              Importar Más
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
