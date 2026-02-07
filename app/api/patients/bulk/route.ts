import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { PatientService } from "@/services/patient/patientService";
import type { CreatePatientData } from "@/services/patient/types";

const patientService = new PatientService(prisma);

/**
 * POST /api/patients/bulk
 * Crea múltiples pacientes
 * Rate limit: 5 req/min
 */
export async function POST(request: NextRequest)
{
  try
  {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id)
    {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(`patients:bulk:${session.user.id}`, 5, 60);

    if (!rateLimit.allowed)
    {
      return NextResponse.json(
        { error: "Límite de solicitudes excedido" },
        {
          status: 429,
          headers: getRateLimitHeaders(0, rateLimit.resetTime),
        }
      );
    }

    const body = await request.json() as { patients: CreatePatientData[] };

    if (!Array.isArray(body.patients) || body.patients.length === 0)
    {
      return NextResponse.json(
        { error: "Se requiere un array de pacientes" },
        { status: 400 }
      );
    }

    // Obtener el hospital del médico para asociar los pacientes correctamente
    const profile = await prisma.medicosProfile.findUnique({
      where: { userId: session.user.id },
      select: { hospital: true }
    });

    if (!profile)
    {
      return NextResponse.json(
        { error: "Perfil de médico no encontrado", code: "PROFILE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Forzar que todos los pacientes pertenezcan al hospital del médico
    const patientsWithHospital = body.patients.map(p => ({
      ...p,
      hospital: profile.hospital
    }));

    const result = await patientService.createMany(patientsWithHospital);

    if (!result.success)
    {
      console.error("❌ Error en createMany:", {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details
      });

      return NextResponse.json(
        {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details
        },
        {
          status: result.error.statusCode,
          headers: getRateLimitHeaders(rateLimit.remaining || 4, rateLimit.resetTime),
        }
      );
    }

    return NextResponse.json(
      { success: true },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimit.remaining || 4, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en POST /api/patients/bulk:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
