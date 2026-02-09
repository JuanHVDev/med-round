"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MedRoundLogo } from "@/components/ui/med-round-logo";

interface VerificationMessageProps {
  email: string;
  onBack: () => void;
}

export function VerificationMessage({ email, onBack }: VerificationMessageProps) {
  return (
    <Card className="w-full max-w-lg mx-auto bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl">
      <CardHeader className="text-center pt-8">
        <div className="flex justify-center mb-4">
          <MedRoundLogo size="lg" />
        </div>
        <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-display font-bold">¡Registro Exitoso!</CardTitle>
        <CardDescription className="text-base mt-3">
          Hemos enviado un email de verificación a:
          <br />
          <strong className="text-primary font-mono">{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg text-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="font-medium">Próximos pasos:</p>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-6">
            <li>Revisa tu bandeja de entrada</li>
            <li>Haz clic en el enlace de verificación</li>
            <li>¡Listo! Podrás iniciar sesión</li>
          </ol>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground text-center justify-center">
          <AlertCircle className="h-4 w-4" />
          <p>¿No recibiste el email? Revisa tu carpeta de spam.</p>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2 border-primary/20 hover:bg-primary/5">
            <ArrowLeft className="h-4 w-4" />
            Volver al registro
          </Button>
          <Link href="/login">
            <Button variant="glow">Ir al Login</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
