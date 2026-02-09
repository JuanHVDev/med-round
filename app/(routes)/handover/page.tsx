/**
 * Página Principal de Handover
 *
 * Lista todos los handovers del usuario con filtros.
 * Permite crear nuevos handovers y acceder a handovers existentes.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverClient } from "./HandoverClient";

export const metadata: Metadata = {
  title: "Entrega de Guardia",
  description: "Gestiona tus handoffs y transfieres información crítica entre turnos médicos de forma segura.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function HandoverPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userProfile = await prisma.medicosProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Perfil no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let recentHandovers: Array<Record<string, unknown>> = [];
  let stats = { total: 0, draft: 0, inProgress: 0, finalized: 0 };

  try {
    recentHandovers = await prisma.handover.findMany({
      where: {
        createdBy: userProfile.id,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        creator: {
          select: { fullName: true },
        },
      },
    });
  } catch (error) {
    console.warn("Tabla handovers no existe o error:", error);
    recentHandovers = [];
  }

  try {
    const allHandovers = await prisma.handover.findMany({
      where: { createdBy: userProfile.id },
    });
    stats = {
      total: allHandovers.length,
      draft: allHandovers.filter((h) => h.status === "DRAFT").length,
      inProgress: allHandovers.filter((h) => h.status === "IN_PROGRESS").length,
      finalized: allHandovers.filter((h) => h.status === "FINALIZED").length,
    };
  } catch (error) {
    console.warn("Error counting handovers:", error);
    stats = { total: 0, draft: 0, inProgress: 0, finalized: 0 };
  }

  const statsCards = [
    {
      title: "Total",
      value: stats.total,
      icon: FileText,
      color: "text-cyan-400",
      gradient: "from-cyan-500/20",
    },
    {
      title: "Borradores",
      value: stats.draft,
      icon: Clock,
      color: "text-amber-400",
      gradient: "from-amber-500/20",
    },
    {
      title: "En Progreso",
      value: stats.inProgress,
      icon: AlertTriangle,
      color: "text-orange-400",
      gradient: "from-orange-500/20",
    },
    {
      title: "Finalizados",
      value: stats.finalized,
      icon: CheckCircle,
      color: "text-emerald-400",
      gradient: "from-emerald-500/20",
    },
  ];

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="relative z-10 container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Entrega de Guardia</h1>
            <p className="text-muted-foreground">
              Gestiona tus handovers y transfieres información entre turnos
            </p>
          </div>
          <Link href="/handover/new">
            <Button variant="glow">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Handover
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="relative z-10">
                <AnimatedCounter value={stat.value} className={`text-3xl font-display font-bold ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <HandoverClient hospital={userProfile.hospital || ""} createdBy={userProfile.id} />
      </div>
    </div>
  );
}
