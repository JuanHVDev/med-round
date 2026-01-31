"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          </div>
        </div>
      </div>

      {/* Error Content */}
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto modern-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Error en el Dashboard</CardTitle>
            <CardDescription>
              No se pudo cargar la información del dashboard. Por favor, intenta nuevamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={reset}
              className="w-full btn-primary gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Recargar página
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
