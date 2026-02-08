/**
 * API Route: /api/handover/[id]/finalize
 *
 * Endpoint para finalizar un handover:
 * - POST: Finaliza un handover y genera el resumen
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ErrorCodes } from "@/lib/errors";
import { HandoverService } from "@/services/handover/handoverService";

const handoverService = new HandoverService(prisma);

/**
 * POST /api/handover/[id]/finalize
 * Finaliza un handover y genera el resumen automáticamente
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const result = await handoverService.finalize(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message, code: result.error?.code },
        { status: result.error?.statusCode || 400 }
      );
    }

    return NextResponse.json({
      handover: result.handover,
      message: "Handover finalizado correctamente",
    });
  } catch (error) {
    console.error("Error en POST /api/handover/[id]/finalize:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: ErrorCodes.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
