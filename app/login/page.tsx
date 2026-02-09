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
import { MedRoundLogo } from "@/components/ui/med-round-logo";

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
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="text-center space-y-6 pt-8">
          <div className="flex justify-center">
            <MedRoundLogo size="lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display font-bold">Iniciar Sesión</CardTitle>
            <CardDescription className="mt-2">
              Accede a tu cuenta de MedRound
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-card/50 border-primary/20 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-card/50 border-primary/20 focus:border-primary/50 focus:ring-primary/20 font-mono"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {needsVerification && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-600">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                      className="mt-2 text-xs text-amber-600 underline hover:text-amber-500 disabled:opacity-50"
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
              variant="glow"
              className="w-full"
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
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline"
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
