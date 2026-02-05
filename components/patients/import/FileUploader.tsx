/**
 * Componente para subir archivos con drag & drop
 * 
 * Soporta: CSV, PDF, imágenes (JPG, PNG)
 * Máximo: 10MB
 * 
 * Dependencias: react-dropzone
 */

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, FileSpreadsheet, Image, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  /** Callback cuando se selecciona un archivo */
  onFileSelected: (file: File) => void;
  /** Indica si está procesando */
  isProcessing?: boolean;
  /** Error a mostrar */
  error?: string | null;
}

/**
 * Componente de carga de archivos con soporte drag & drop
 */
export function FileUploader({
  onFileSelected,
  isProcessing = false,
  error,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !isProcessing) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected, isProcessing]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "text/csv": [".csv"],
        "application/pdf": [".pdf"],
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
      disabled: isProcessing,
    });

  const handleClear = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <Image className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {fileRejections.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
          Archivo no válido. Asegúrate de subir un CSV, PDF o imagen (máx 10MB).
        </div>
      )}

      {!selectedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed p-12 text-center cursor-pointer transition-all",
            isDragActive && "border-primary bg-primary/5 scale-105",
            isProcessing && "opacity-50 cursor-not-allowed",
            !isDragActive && !isProcessing && "hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            {isProcessing ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground" />
            )}
            
            <div>
              <p className="text-lg font-medium">
                {isDragActive
                  ? "Suelta el archivo aquí"
                  : isProcessing
                  ? "Procesando..."
                  : "Arrastra un archivo o haz clic para seleccionar"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Soporta CSV, PDF o imágenes (JPG, PNG) - Máximo 10MB
              </p>
            </div>

            <div className="flex gap-4 mt-4">
              <FileSpreadsheet className="h-8 w-8 text-green-500" />
              <FileText className="h-8 w-8 text-red-500" />
              <Image className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            {getFileIcon(selectedFile)}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {!isProcessing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
