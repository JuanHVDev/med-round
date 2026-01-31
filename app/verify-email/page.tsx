"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "Verificando tu email..." : "Token de verificación no encontrado. Por favor revisa el enlace en tu email."
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const verifyEmail = async () => {
      try {
        const result = await authClient.verifyEmail({
          query: { token },
        });

        if (!isMounted) return;

        if (result.error) {
          setStatus("error");
          setMessage(result.error.message || "Error al verificar el email. El token puede haber expirado.");
        } else {
          setStatus("success");
          setMessage("¡Tu email ha sido verificado exitosamente! Ya puedes iniciar sesión.");
        }
      } catch (error) {
        if (!isMounted) return;
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Error inesperado al verificar el email. Por favor intenta nuevamente.");
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Verificando..."}
            {status === "success" && "¡Email Verificado!"}
            {status === "error" && "Error de Verificación"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          {status === "success" && (
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          )}
          {status === "error" && (
            <>
              <Link href="/login">
                <Button variant="outline">Volver al Login</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
