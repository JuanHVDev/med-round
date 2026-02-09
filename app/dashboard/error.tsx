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
    <div className="p-6">
      <Card className="max-w-md mx-auto bg-card/50 border-primary/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-display">Error en el Dashboard</CardTitle>
          <CardDescription>
            No se pudo cargar la información del dashboard. Por favor, intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={reset}
            className="w-full gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full hover:bg-primary/5"
          >
            Recargar página
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
