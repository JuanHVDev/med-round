/**
 * Página de listado de pacientes (censo)
 *
 * Muestra todos los pacientes del hospital del usuario actual
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientService } from "@/services/patient/patientService";
import { PatientList } from "@/components/patients/PatientList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Censo de Pacientes",
  description: "Visualiza y gestiona el censo de pacientes hospitalizados. Accede a historiales, notas SOAP y tareas asignadas.",
  keywords: ["pacientes", "censo", "hospitalización", "historia clínica", "medround"],
  robots: {
    index: false,
    follow: true,
  },
};

export default async function patientsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.medicosProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect("/dashboard");
  }

  const patientService = new PatientService(prisma);
  const result = await patientService.list({
    hospital: profile.hospital,
    isActive: true,
    limit: 50,
  });

  if (!result.success) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-red-500">Error al cargar pacientes</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Censo de Pacientes</h1>
          <p className="text-muted-foreground">
            Gestiona los pacientes hospitalizados en {profile.hospital}
          </p>
        </div>

        <PatientList initialPatients={result.patients} total={result.total} />
      </div>
    </div>
  );
}
