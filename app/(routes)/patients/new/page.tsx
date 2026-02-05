/**
 * Página para crear un nuevo paciente
 * 
 * Server Component que obtiene el hospital del usuario
 */

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PatientForm } from "./PatientForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuevo Paciente - MedRound",
  description: "Registrar un nuevo paciente en el censo",
};

export default async function NewPatientPage() {
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Nuevo Paciente</h1>
      <p className="text-muted-foreground mb-8">
        Completa la información para registrar al paciente
      </p>

      <PatientForm hospital={profile.hospital} />
    </div>
  );
}
