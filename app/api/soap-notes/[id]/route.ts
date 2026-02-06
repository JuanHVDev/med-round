import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { SoapService } from "@/services/soap/soapService";
import type { UpdateSoapNoteData } from "@/services/soap/types";

const soapService = new SoapService(prisma);

/**
 * GET /api/soap-notes/:id
 * Obtiene una nota SOAP específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)
{
  try
  {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id)
    {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const result = await soapService.getById(id);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ note: result.note });
  } catch (error)
  {
    console.error("Error en GET /api/soap-notes/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/soap-notes/:id
 * Actualiza una nota SOAP existente
 * Rate limit: 10 req/min
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)
{
  try
  {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id)
    {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(`soap:update:${session.user.id}`, 10, 60);

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

    const body = await request.json() as UpdateSoapNoteData;

    const result = await soapService.update(id, body);

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
          headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
        }
      );
    }

    return NextResponse.json(
      { note: result.note },
      {
        headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en PATCH /api/soap-notes/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/soap-notes/:id
 * Elimina una nota SOAP
 * Rate limit: 10 req/min
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)
{
  try
  {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id)
    {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(`soap:delete:${session.user.id}`, 10, 60);

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

    const result = await soapService.delete(id);

    if (!result.success)
    {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(
      { message: "Nota eliminada correctamente" },
      {
        headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
      }
    );
  } catch (error)
  {
    console.error("Error en DELETE /api/soap-notes/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
