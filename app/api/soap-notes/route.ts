import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { SoapService } from "@/services/soap/soapService";
import type { CreateSoapNoteData, ListSoapNotesFilters } from "@/services/soap/types";

const soapService = new SoapService(prisma);

/**
 * GET /api/soap-notes
 * Lista notas SOAP con filtros y paginación
 * Rate limit: 10 req/min
 */
export async function GET(request: NextRequest)
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

    const rateLimit = await checkRateLimit(`soap:list:${session.user.id}`, 10, 60);

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

    const filters: ListSoapNotesFilters = {
      hospital: hospital || "",
      patientId: searchParams.get("patientId") || undefined,
      authorId: searchParams.get("authorId") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined,
    };

    const result = await soapService.list(filters);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(
      {
        notes: result.notes,
        total: result.total,
        page: result.page,
        limit: result.limit,
        hospital: hospital,
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en GET /api/soap-notes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/soap-notes
 * Crea una nueva nota SOAP
 * Rate limit: 5 req/min (más restrictivo para notas médicas)
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

    const rateLimit = await checkRateLimit(`soap:create:${session.user.id}`, 5, 60);

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

    const body = await request.json() as CreateSoapNoteData;

    const result = await soapService.create(body, session.user.id);

    if (!result.success)
    {
      return NextResponse.json(
        {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
        },
        {
          status: result.error.statusCode,
          headers: getRateLimitHeaders(rateLimit.remaining || 4, rateLimit.resetTime),
        }
      );
    }

    return NextResponse.json(
      { note: result.note },
      {
        status: 201,
        headers: getRateLimitHeaders(rateLimit.remaining || 4, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en POST /api/soap-notes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
