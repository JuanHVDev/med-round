import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientService } from "@/services/patient/patientService";
import type { UpdatePatientData } from "@/services/patient/types";

const patientService = new PatientService(prisma);

/**
 * GET /api/patients/:id
 * Obtiene un paciente con sus notas SOAP y tareas
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const includeRelations = request.nextUrl.searchParams.get("include") === "relations";

    const result = includeRelations
      ? await patientService.getByIdWithRelations(id)
      : await patientService.getById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ patient: result.patient });
  } catch (error) {
    console.error("Error en GET /api/patients/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/patients/:id
 * Actualiza los datos de un paciente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json() as UpdatePatientData;

    const result = await patientService.update(id, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code, details: result.error.details },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ patient: result.patient });
  } catch (error) {
    console.error("Error en PATCH /api/patients/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/:id
 * Da de alta a un paciente (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const result = await patientService.discharge(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DELETE /api/patients/:id:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
