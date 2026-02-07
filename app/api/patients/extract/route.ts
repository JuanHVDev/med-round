import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

import type { LanguageModel } from "ai";

const patientExtractionSchema = z.object({
  patients: z.array(z.object({
    firstName: z.string(),
    lastName: z.string(),
    medicalRecordNumber: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(["M", "F", "O"]),
    hospital: z.string(),
    roomNumber: z.string(),
    bedNumber: z.string(),
    admissionDate: z.string(),
    diagnosis: z.string(),
    service: z.string(),
    attendingDoctor: z.string(),
  }))
});

export async function POST(request: NextRequest)
{
  try
  {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id)
    {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { text, image } = await request.json();

    if (!text && !image)
    {
      return NextResponse.json({ error: "No se proporcionó contenido para extraer" }, { status: 400 });
    }

    const extractionPrompt = `Extrae una lista de pacientes con su información detallada de los siguientes datos.
    Si algún dato no está presente, intenta inferirlo o deja un string vacío.
    El formato de fecha debe ser YYYY-MM-DD.
    Género debe ser M, F u O (donde M es Masculino, F es Femenino y O es Otro).
    
    Contenido a procesar:
    ${text || "Imagen adjunta"}`;

    const model: LanguageModel = google("gemini-2.5-flash");

    const generationOptions = image
      ? {
          messages: [
            {
              role: "user" as const,
              content: [
                { type: "text" as const, text: extractionPrompt },
                {
                  type: "image" as const,
                  image: image.includes(",") ? image.split(",")[1] : image,
                }
              ]
            }
          ],
        }
      : {
          prompt: extractionPrompt,
        };

    const { object } = await generateObject({
      model,
      schema: patientExtractionSchema,
      ...generationOptions,
    });

    return NextResponse.json(object);
  } catch (error)
  {
    console.error("Error en extracción IA:", error);
    return NextResponse.json(
      { error: "Error al procesar el documento con IA", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
