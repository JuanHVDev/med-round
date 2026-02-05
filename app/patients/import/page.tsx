"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import
{
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { toast } from "sonner";
import Papa, { ParseResult } from "papaparse";
import type { CreatePatientData, PatientWithRelations } from "@/services/patient/types";
import { PatientTable } from "@/components/patients/PatientTable";

type ImportStatus = "idle" | "uploading" | "extracting" | "preview" | "importing" | "success" | "error";

export default function ImportPage()
{
  const router = useRouter();
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [extractedPatients, setExtractedPatients] = useState<CreatePatientData[]>([]);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) =>
  {
    if (acceptedFiles.length > 0)
    {
      setFile(acceptedFiles[0]);
      setStatus("idle");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"]
    },
    multiple: false
  });

  const processCSV = (file: File) =>
  {
    setStatus("extracting");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<Record<string, unknown>>) =>
      {
        const patients = results.data.map((row) => {
          const rowData = row as Record<string, unknown>;
          return {
            firstName: rowData.firstName || rowData.Nombre || "",
            lastName: rowData.lastName || rowData.Apellido || "",
            medicalRecordNumber: rowData.medicalRecordNumber || rowData.HC || "",
            dateOfBirth: rowData.dateOfBirth || rowData.FechaNac || "",
            gender: (() => {
              const g = String(rowData.gender || rowData.Sexo || "").toUpperCase();
              if (g.startsWith("M")) return "M";
              if (g.startsWith("F")) return "F";
              return "O";
            })(),
            hospital: rowData.hospital || "Hospital General",
            roomNumber: rowData.roomNumber || rowData.Habitacion || "",
            bedNumber: rowData.bedNumber || rowData.Cama || "",
            admissionDate: rowData.admissionDate || rowData.FechaIngreso || new Date().toISOString().split("T")[0],
            diagnosis: rowData.diagnosis || rowData.Diagnostico || "",
            service: rowData.service || rowData.Servicio || "",
            attendingDoctor: rowData.attendingDoctor || rowData.Medico || "",
            isActive: true
          };
        }) as CreatePatientData[];

        setExtractedPatients(patients);
        setStatus("preview");
        toast.success("CSV procesado", {
          description: `Se encontraron ${patients.length} pacientes.`
        });
      },
      error: (error: Error) =>
      {
        setStatus("error");
        toast.error("Error al procesar CSV", {
          description: error instanceof Error ? error.message : "Error desconocido"
        });
      }
    });
  };

  const processWithAI = async (file: File) =>
  {
    setStatus("extracting");
    setProgress(20);

    try
    {
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) =>
      {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setProgress(50);

      const res = await fetch("/api/patients/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: file.type.startsWith("image/") ? fileData : null,
          text: file.type === "application/pdf" ? "Contenido de PDF" : null, // Aquí iría la extracción de texto si no se envía la imagen
          fileType: file.type
        })
      });

      if (!res.ok) throw new Error("Error en la extracción IA");

      const data = await res.json();
      setExtractedPatients(data.patients);
      setStatus("preview");
      setProgress(100);

      toast.success("Extracción completada", {
        description: `IA extrajo ${data.patients.length} pacientes correctamente.`
      });
    } catch (error)
    {
      console.error(error);
      setStatus("error");
      toast.error("Error de IA", {
        description: "No se pudo procesar el documento con inteligencia artificial."
      });
    }
  };

  const handleStartProcess = () =>
  {
    if (!file) return;

    if (file.type === "text/csv")
    {
      processCSV(file);
    } else
    {
      processWithAI(file);
    }
  };

  const handleImport = async () =>
  {
    setStatus("importing");
    try
    {
      const res = await fetch("/api/patients/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patients: extractedPatients })
      });

      if (!res.ok)
      {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al importar");
      }

      setStatus("success");
      toast.success("Importación exitosa", {
        description: `${extractedPatients.length} pacientes han sido agregados al censo.`
      });

      setTimeout(() => router.push("/patients"), 2000);
    } catch (error: unknown)
    {
      console.error(error);
      setStatus("preview"); // Volver a preview para corregir
      toast.error("Error al importar", {
        description: error instanceof Error ? error.message : "Error desconocido al crear pacientes"
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Importar Censo</h1>
            <p className="text-slate-500 mt-2">
              Sube un archivo CSV o una imagen/PDF del censo para extraer datos automáticamente.
            </p>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        </div>

        {status === "idle" && (
          <Card className="border-dashed border-2 bg-white">
            <CardContent className="pt-10 pb-10">
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? "text-blue-600 bg-blue-50/50" : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                <input {...getInputProps()} />
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <Upload className="h-10 w-10" />
                </div>
                <p className="text-lg font-medium text-slate-700">
                  {file ? file.name : "Arrastra un archivo aquí o haz clic"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Formatos soportados: CSV, PDF, PNG, JPG
                </p>
              </div>

              {file && (
                <div className="mt-8 flex justify-center">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                    onClick={handleStartProcess}
                  >
                    Procesar {file.type === "text/csv" ? "CSV" : "con IA"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(status === "extracting" || status === "importing") && (
          <Card className="bg-white">
            <CardContent className="py-12 flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-slate-800">
                {status === "extracting" ? "Analizando documento..." : "Guardando en base de datos..."}
              </h2>
              <p className="text-slate-500 mt-2 text-center max-w-sm">
                Esto puede tomar unos segundos. Estamos {status === "extracting" ? "usando IA para estructurar los datos" : "verificando e insertando la información"}.
              </p>
              {status === "extracting" && (
                <div className="w-full max-w-xs mt-6">
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {status === "preview" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm border-blue-100">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Previsualización de Datos</h2>
                    <p className="text-sm text-slate-500">
                      Hemos extraído {extractedPatients.length} pacientes. Por favor revisa antes de confirmar.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStatus("idle")}>Reintentar</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleImport}>
                    Confirmar Importación
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <PatientTable
                patients={extractedPatients as unknown as PatientWithRelations[]}
                onAction={() => { }}
              />
            </div>
          </div>
        )}

        {status === "success" && (
          <Card className="bg-white">
            <CardContent className="py-12 flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">¡Importación Completada!</h2>
              <p className="text-slate-500 mt-2">Redirigiendo al censo de pacientes...</p>
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card className="bg-white border-red-100">
            <CardContent className="py-12 flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
              <h2 className="text-xl font-bold text-slate-800">Algo salió mal</h2>
              <p className="text-slate-500 mt-2 text-center">
                No pudimos procesar el archivo. Asegúrate de que el formato sea correcto.
              </p>
              <Button className="mt-6" onClick={() => setStatus("idle")}>Volver a intentar</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
