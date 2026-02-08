/**
 * API Route: /api/handover
 *
 * Endpoints para gestión de handovers:
 * - GET: Lista handovers con filtros
 * - POST: Crea un nuevo handover
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { ErrorCodes } from "@/lib/errors";
import { HandoverService } from "@/services/handover/handoverService";
import { HandoverGenerator } from "@/services/handover/handoverGenerator";

const handoverService = new HandoverService(prisma);
const handoverGenerator = new HandoverGenerator();

/**
 * GET /api/handover
 * Lista handovers con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado", code: ErrorCodes.SESSION_EXPIRED },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const filters = {
      hospital: searchParams.get("hospital") || undefined,
      service: searchParams.get("service") || undefined,
      status: (() => {
        const value = searchParams.get("status");
        if (!value || value === "null" || value === "undefined") return undefined;
        return value as "DRAFT" | "IN_PROGRESS" | "FINALIZED";
      })(),
      createdBy: searchParams.get("createdBy") || undefined,
      shiftDate: searchParams.get("shiftDate") || undefined,
      shiftType: (() => {
        const value = searchParams.get("shiftType");
        if (!value || value === "null" || value === "undefined") return undefined;
        return value as "MORNING" | "AFTERNOON" | "NIGHT";
      })(),
      page: pageParam ? parseInt(pageParam, 10) : undefined,
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
    };

    const result = await handoverService.list(filters);

    if (!result.success) {
      console.error("Handover list error:", result.error);
      return NextResponse.json(
        { error: result.error?.message, code: result.error?.code },
        { status: result.error?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      handovers: result.handovers,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    console.error("Error en GET /api/handover:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: ErrorCodes.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

/**
 * POST /api/handover
 * Crea un nuevo handover
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado", code: ErrorCodes.SESSION_EXPIRED },
        { status: 401 }
      );
    }

    const rateLimit = await checkRateLimit(`handover:${session.user.id}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes", code: ErrorCodes.RATE_LIMIT_ERROR },
        { status: 429 }
      );
    }

    const body = await request.json();

    const result = await handoverService.create(body, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message, code: result.error?.code },
        { status: result.error?.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { handover: result.handover },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/handover:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: ErrorCodes.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
