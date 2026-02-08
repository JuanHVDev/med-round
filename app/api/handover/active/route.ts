/**
 * API Endpoint: GET /api/handover/active
 *
 * Obtiene el handover en progreso para el turno actual
 * del hospital del médico autenticado.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import type { HandoverWithRelations } from "@/services/handover/types";

interface ActiveHandoverResponse {
  handover: HandoverWithRelations | null;
  message?: string;
}

/**
 * GET /api/handover/active
 * Query params:
 *   - hospital: (opcional) nombre del hospital
 *   - date: (opcional) fecha en formato YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(
      `handover:active:${session.user.id}`,
      10,
      60
    );

    if (!rateLimit.allowed) {
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
    const dateParam = searchParams.get("date");

    if (!hospital) {
      const profile = await prisma.medicosProfile.findUnique({
        where: { userId: session.user.id },
        select: { hospital: true },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Perfil de médico no encontrado", code: "PROFILE_NOT_FOUND" },
          { status: 404 }
        );
      }
      hospital = profile.hospital;
    }

    const now = new Date();
    const today = dateParam ? new Date(dateParam) : now;
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeHandover = await prisma.handover.findFirst({
      where: {
        hospital,
        status: { in: ["DRAFT", "IN_PROGRESS"] },
        shiftDate: {
          gte: today,
          lt: tomorrow,
        },
        createdAt: {
          gte: today,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!activeHandover) {
      return NextResponse.json(
        {
          handover: null,
          message: "No hay handover activo para este turno",
        } as ActiveHandoverResponse,
        {
          headers: getRateLimitHeaders(
            rateLimit.remaining || 9,
            rateLimit.resetTime
          ),
        }
      );
    }

    const response: ActiveHandoverResponse = {
      handover: activeHandover as unknown as HandoverWithRelations,
    };

    return NextResponse.json(response, {
      headers: getRateLimitHeaders(rateLimit.remaining || 9, rateLimit.resetTime),
    });
  } catch (error) {
    console.error("Error getting active handover:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
