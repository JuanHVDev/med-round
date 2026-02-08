import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardLayoutClient } from "./DashboardLayoutClient";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ShiftStatus } from "@/components/dashboard/ShiftStatus";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - MedRound",
  description: "Gestiona el pase de visita, tareas pendientes y la comunicación entre turnos médicos.",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const stats = {
    totalPatients: 0,
    pendingTasks: 0,
    criticalPatients: 0,
    notesToday: 0,
  };

  const recentPatients = [
    {
      id: "1",
      name: "María García",
      bedNumber: 101,
      condition: "Estable",
    },
    {
      id: "2",
      name: "Juan Pérez",
      bedNumber: 102,
      condition: "En observación",
    },
  ];

  const pendingTasks = [
    {
      id: "1",
      title: "Control de signos vitales",
      priority: "media" as const,
      patientName: "María García",
      patientId: "1",
    },
    {
      id: "2",
      title: "Administrar medicación",
      priority: "urgente" as const,
      patientName: "Juan Pérez",
      patientId: "2",
    },
  ];

  return (
    <DashboardLayoutClient>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-500">
              Bienvenido de nuevo, {session.user.name || "Doctor(a)"}
            </p>
          </div>
        </div>

        <ShiftStatus />

        <DashboardStats stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentPatients patients={recentPatients} />
          <PendingTasks tasks={pendingTasks} />
        </div>

        <QuickActions />
      </div>
    </DashboardLayoutClient>
  );
}
