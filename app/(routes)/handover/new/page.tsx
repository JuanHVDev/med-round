/**
 * Página de Creación de Nuevo Handover
 *
 * Página para crear un nuevo handover paso a paso.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverBuilder } from "@/components/handover/HandoverBuilder";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function NewHandoverPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userProfile = await prisma.medicosProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile) {
    redirect("/register");
  }

  return (
    <div className="container mx-auto py-8">
      <HandoverBuilder hospital={userProfile.hospital} />
    </div>
  );
}
