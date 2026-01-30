import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardActions } from "./DashboardActions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - MedRound",
  description: "Gestiona el pase de visita, tareas pendientes y la comunicación entre turnos médicos.",
  keywords: ["dashboard", "gestión médica", "pase de visita", "pendientes"],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <DashboardActions userName={session.user.name || "Usuario"} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Bienvenido!
              </h2>
              <p className="text-gray-600">
                Tu dashboard está listo para ser personalizado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
