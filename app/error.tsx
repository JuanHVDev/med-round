"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card/50 border-primary/10 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-display">¡Algo salió mal!</CardTitle>
          <CardDescription>
            Ha ocurrido un error inesperado. Por favor, intenta nuevamente o
            contacta con nosotros si el problema persiste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4">
              <p className="text-sm text-red-400 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar nuevamente
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full gap-2 hover:bg-primary/5">
                <Home className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>

            <a
              href="mailto:soporte@medround.com"
              className="block"
            >
              <Button variant="ghost" className="w-full gap-2 hover:bg-primary/5">
                <Mail className="h-4 w-4" />
                Contactar Soporte
              </Button>
            </a>
          </div>

          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              ID de error: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
