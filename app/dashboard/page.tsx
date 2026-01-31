import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardActions } from "./DashboardActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <DashboardActions userName={session.user.name || "Usuario"} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="modern-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">¡Bienvenido!</CardTitle>
              <CardDescription>
                Tu dashboard está listo para ser personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <p>Comienza a gestionar el pase de visita y tus tareas pendientes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
