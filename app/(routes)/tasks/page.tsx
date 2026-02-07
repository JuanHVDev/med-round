import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TasksPageClient } from "./TasksPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tareas - MedRound",
  description: "Gestiona las tareas del turno",
};

export default async function TasksPage() {
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
    <TasksPageClient
      assignedTo={profile.id}
      hospital={profile.hospital}
    />
  );
}
