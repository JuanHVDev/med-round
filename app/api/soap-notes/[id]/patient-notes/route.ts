import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { SoapService } from "@/services/soap/soapService";

const soapService = new SoapService(prisma);

/**
 * GET /api/patients/:id/soap-notes
 * Obtiene todas las notas SOAP de un paciente específico
 * Rate limit: 10 req/min
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)
{
  try
  {
    const { id: patientId } = await params;
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

    const rateLimit = await checkRateLimit(`soap:patient:${session.user.id}`, 10, 60);

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

    let hospital = request.nextUrl.searchParams.get("hospital");

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

    const result = await soapService.getByPatient(patientId, hospital || "");

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
        patientId: patientId,
      },
      {
        headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en GET /api/patients/:id/soap-notes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
