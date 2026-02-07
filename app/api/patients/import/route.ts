/**
 * API Route para importación de pacientes desde archivos
 * 
 * POST /api/patients/import
 * 
 * Recibe un archivo (CSV, PDF o imagen), lo procesa con IA
 * y retorna los pacientes extraídos para preview/edición
 * 
 * Seguridad:
 * - Requiere autenticación
 * - Rate limiting: 5 solicitudes/hora por usuario
 * - Procesamiento server-side (API key nunca expuesta)
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { FileExtractionService } from "@/services/import/fileExtractionService";
import { AIExtractionService } from "@/services/import/aiExtractionService";
import { google } from "@ai-sdk/google";
import type { ImportApiResponse } from "@/services/import/types";

/**
 * Servicio de extracción de archivos (singleton)
 */
const fileExtractionService = new FileExtractionService();

/**
 * POST handler para importación de pacientes
 * 
 * @param request - Request de Next.js con archivo en FormData
 * @returns JSON con pacientes extraídos o error
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ImportApiResponse | { error: string; details?: string }>> {
  try {
    // 1. Verificar autenticación
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Aplicar rate limiting (5 importaciones/hora)
    const rateLimit = await checkRateLimit(
      `patients:import:${session.user.id}`,
      5,
      3600 // 1 hora en segundos
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Límite de importaciones alcanzado. Máximo 5 por hora." },
        {
          status: 429,
          headers: getRateLimitHeaders(0, rateLimit.resetTime),
        }
      );
    }

    // 3. Obtener archivo del form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 }
      );
    }

    // 4. Validar tamaño (máx 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Archivo demasiado grande. Máximo 10MB." },
        { status: 400 }
      );
    }

    // 5. Extraer texto del archivo
    let extractedContent: string;
    let isImage = false;

    try {
      const fileType = fileExtractionService.detectFileType(file);
      extractedContent = await fileExtractionService.extractText(file);
      isImage = fileType === "image";
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // 6. Procesar con IA
    const model = google("gemini-2.5-flash");
    const aiService = new AIExtractionService(model);
    
    let extractionResult;

    if (isImage) {
      extractionResult = await aiService.extractFromImage(extractedContent);
    } else {
      extractionResult = await aiService.extractFromText(extractedContent);
    }

    // 7. Responder con resultado
    if (!extractionResult.success) {
      return NextResponse.json(
        {
          success: false,
          patients: [],
          count: 0,
          errors: extractionResult.errors,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        patients: extractionResult.patients,
        count: extractionResult.patients.length,
      },
      {
        headers: getRateLimitHeaders(
          rateLimit.remaining ?? 4,
          rateLimit.resetTime
        ),
      }
    );
  } catch (error) {
    console.error("Error en importación:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
