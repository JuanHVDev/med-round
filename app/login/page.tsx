"use client";

import { useState } from "react";
import { signIn, sendVerificationEmail } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setNeedsVerification(false);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result?.error) {
        if (result.error.status === 403) {
          setNeedsVerification(true);
          setUnverifiedEmail(email);
          setError("Por favor verifica tu email antes de iniciar sesión.");
        } else {
          setError(result.error.message || "Error en el inicio de sesión");
        }
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setIsLoading(true);
    try {
      await sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: "/dashboard",
      });
      setError("");
      setNeedsVerification(false);
      alert("Email de verificación reenviado. Por favor revisa tu bandeja de entrada.");
    } catch {
      setError("Error al reenviar el email de verificación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta de MedRound
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-lg"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {needsVerification && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="mt-2 text-xs text-amber-700 underline hover:text-amber-900 disabled:opacity-50"
                    >
                      Reenviar email de verificación
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="text-center text-sm">
              <Link 
                href="/register" 
                className="text-primary hover:text-primary/90 underline-offset-4 hover:underline"
              >
                ¿No tienes cuenta? Regístrate
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
