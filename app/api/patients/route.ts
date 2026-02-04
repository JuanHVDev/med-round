import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { PatientService } from "@/services/patient/patientService";
import type { CreatePatientData, ListPatientsFilters } from "@/services/patient/types";

const patientService = new PatientService(prisma);

/**
 * GET /api/patients
 * Lista pacientes con filtros y paginación
 * Rate limit: 10 req/min
 */
export async function GET(request: NextRequest)
{
  try
  {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id)
    {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(`patients:list:${session.user.id}`, 10, 60);

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

    const searchParams = request.nextUrl.searchParams;
    let hospital = searchParams.get("hospital");

    // Si no se proporciona hospital, extraerlo del perfil del médico
    if (!hospital)
    {
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
      hospital = profile.hospital;
    }

    const filters: ListPatientsFilters = {
      hospital: hospital || "",
      isActive: searchParams.get("isActive") === "false" ? false : true,
      service: searchParams.get("service") || undefined,
      bedNumber: searchParams.get("bedNumber") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined,
    };

    const result = await patientService.list(filters);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(
      {
        patients: result.patients,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hospital: hospital, // Enviar el nombre del hospital
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en GET /api/patients:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Crea un nuevo paciente
 * Rate limit: 10 req/min
 */
export async function POST(request: NextRequest)
{
  try
  {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id)
    {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(`patients:create:${session.user.id}`, 10, 60);

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

    const body = await request.json() as CreatePatientData;

    const result = await patientService.create(body);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code, details: result.error.details },
        {
          status: result.error.statusCode,
          headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
        }
      );
    }

    return NextResponse.json(
      { patient: result.patient },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en POST /api/patients:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
