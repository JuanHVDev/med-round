/**
 * API Route: /api/handover/[id]
 *
 * Endpoints para un handover específico:
 * - GET: Obtiene un handover por ID
 * - PATCH: Actualiza un handover
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
 * GET /api/handover/[id]
 * Obtiene un handover por su ID
 */
export async function GET(
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
    const result = await handoverService.getById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message, code: result.error?.code },
        { status: result.error?.statusCode || 404 }
      );
    }

    return NextResponse.json({ handover: result.handover });
  } catch (error) {
    console.error("Error en GET /api/handover/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: ErrorCodes.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/handover/[id]
 * Actualiza un handover (agrega pacientes, tareas, notas)
 */
export async function PATCH(
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
    const body = await request.json();

    const result = await handoverService.update(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message, code: result.error?.code },
        { status: result.error?.statusCode || 400 }
      );
    }

    return NextResponse.json({ handover: result.handover });
  } catch (error) {
    console.error("Error en PATCH /api/handover/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: ErrorCodes.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
