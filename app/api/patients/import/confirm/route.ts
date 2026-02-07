/**
 * API Route para confirmar importación de pacientes
 * 
 * POST /api/patients/import/confirm
 * 
 * Recibe los pacientes validados y los crea en la base de datos
 * 
 * Seguridad:
 * - Requiere autenticación
 * - Rate limiting: 20 creaciones/minuto
 * - Validación de cada paciente antes de crear
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { PatientService } from "@/services/patient/patientService";
import { patientSchema } from "@/lib/schemas/patientSchema";
import type { ExtractedPatient } from "@/services/import/types";

const patientService = new PatientService(prisma);

/**
 * Tipos de la petición
 */
interface ConfirmImportRequest {
  patients: ExtractedPatient[];
  hospital: string;
}

interface CreatedPatient {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  bedNumber: string;
}

interface ConfirmImportResponse {
  success: boolean;
  created: CreatedPatient[];
  failed: Array<{
    patient: ExtractedPatient;
    error: string;
  }>;
  total: number;
}

/**
 * POST handler para confirmar importación
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ConfirmImportResponse | { error: string }>> {
  try {
    // 1. Verificar autenticación
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Obtener perfil del médico
    const profile = await prisma.medicosProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil de médico no encontrado" },
        { status: 400 }
      );
    }

    // 3. Aplicar rate limiting (20 creaciones/minuto)
    const rateLimit = await checkRateLimit(
      `patients:create:${session.user.id}`,
      20,
      60
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Límite de creaciones alcanzado" },
        {
          status: 429,
          headers: getRateLimitHeaders(0, rateLimit.resetTime),
        }
      );
    }

    // 4. Obtener body
    const body: ConfirmImportRequest = await request.json();

    if (!body.patients || !Array.isArray(body.patients) || body.patients.length === 0) {
      return NextResponse.json(
        { error: "Lista de pacientes requerida" },
        { status: 400 }
      );
    }

    const hospital = body.hospital || profile.hospital;
    const created: CreatedPatient[] = [];
    const failed: Array<{ patient: ExtractedPatient; error: string }> = [];

    // 5. Procesar cada paciente
    for (const patientData of body.patients) {
      try {
        // Validar datos mínimos requeridos
        if (!patientData.firstName || !patientData.lastName || !patientData.bedNumber) {
          throw new Error("Faltan datos requeridos (nombre, apellido, cama)");
        }

        // Normalizar datos para el schema
        const normalizedData = {
          medicalRecordNumber: patientData.medicalRecordNumber || `HC-${Date.now().toString(36).toUpperCase()}`,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dateOfBirth || "1990-01-01", //默认值
          gender: (patientData.gender as "M" | "F" | "O") || "M",
          bedNumber: patientData.bedNumber,
          admissionDate: new Date().toISOString(),
          isActive: true,
          roomNumber: patientData.roomNumber,
          service: patientData.service || profile.specialty,
          diagnosis: patientData.diagnosis || "Sin diagnóstico",
          allergies: patientData.allergies,
          attendingDoctor: patientData.attendingDoctor || profile.fullName,
          bloodType: patientData.bloodType as string | undefined,
          emergencyContactName: patientData.emergencyContactName,
          emergencyContactPhone: patientData.emergencyContactPhone,
          insuranceProvider: patientData.insuranceProvider,
          insuranceNumber: patientData.insuranceNumber,
          weight: patientData.weight,
          height: patientData.height,
          specialNotes: patientData.specialNotes,
          dietType: patientData.dietType,
          isolationPrecautions: patientData.isolationPrecautions,
        };

        // Validar con Zod
        const validation = patientSchema.safeParse(normalizedData);

        if (!validation.success) {
          const errorMessages = validation.error.issues.map((e) => e.message).join(", ");
          throw new Error(`Validación fallida: ${errorMessages}`);
        }

        // Crear paciente
        const result = await patientService.create({
          ...normalizedData,
          hospital,
        });

        if (result.success && result.patient) {
          created.push({
            id: result.patient.id,
            medicalRecordNumber: result.patient.medicalRecordNumber,
            firstName: result.patient.firstName,
            lastName: result.patient.lastName,
            bedNumber: result.patient.bedNumber,
          });
        }

        if (!result.success) {
          throw new Error(result.error.message || "Error al crear");
        }
      } catch (error) {
        failed.push({
          patient: patientData,
          error: (error as Error).message,
        });
      }
    }

    // 6. Responder
    return NextResponse.json({
      success: true,
      created,
      failed,
      total: body.patients.length,
    });
  } catch (error) {
    console.error("Error en confirmación de importación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
