/**
 * Página Principal de Handover
 *
 * Lista todos los handovers del usuario con filtros.
 * Permite crear nuevos handovers y acceder a handovers existentes.
 *
 * Autor: MedRound Development Team
 * Fecha: Febrero 2026
 */

import Link from "next/link";
import { Plus, FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HandoverClient } from "./HandoverClient";

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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Entrega de Guardia</h1>
          <p className="text-muted-foreground">
            Gestiona tus handovers y transfieres información entre turnos
          </p>
        </div>
        <Link href="/handover/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Handover
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.finalized}</div>
          </CardContent>
        </Card>
      </div>

      <HandoverClient hospital={userProfile.hospital || ""} />
    </div>
  );
}
