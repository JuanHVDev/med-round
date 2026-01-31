"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VerificationMessageProps {
  email: string;
  onBack: () => void;
}

export function VerificationMessage({ email, onBack }: VerificationMessageProps) {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">¡Registro Exitoso!</CardTitle>
        <CardDescription className="text-base mt-2">
          Hemos enviado un email de verificación a:
          <br />
          <strong className="text-foreground">{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Próximos pasos:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Revisa tu bandeja de entrada</li>
            <li>Haz clic en el enlace de verificación</li>
            <li>¡Listo! Podrás iniciar sesión</li>
          </ol>
        </div>
        
        <div className="text-sm text-muted-foreground text-center">
          <p>¿No recibiste el email?</p>
          <p>Revisa tu carpeta de spam o correo no deseado.</p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al registro
          </Button>
          <Link href="/login">
            <Button>Ir al Login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
