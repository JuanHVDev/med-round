import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes y precios de MedRound. Encuentra el plan perfecto para tu hospital o equipo médico.",
};

const plans = [
  {
    name: "Básico",
    price: "$0",
    period: "/mes",
    description: "Para médicos individuales",
    variant: "outline" as const,
    features: ["Gestión de pacientes", "Notas SOAP", "Tareas básicas"],
  },
  {
    name: "Profesional",
    price: "$29",
    period: "/mes",
    description: "Para equipos pequeños",
    variant: "glow" as const,
    featured: true,
    features: ["Todo lo del Básico", "Handoffs ilimitados", "Reportes avanzados", "Soporte prioritario"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Para hospitales",
    variant: "outline" as const,
    features: ["Todo lo de Profesional", "Múltiples hospitales", "API completa", "Soporte dedicado"],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background py-24 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary mb-4">
            Precios
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Planes Flexibles
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Planes flexibles para equipos médicos de todos los tamaños
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.variant === "glow"
                  ? "border-primary/30 bg-gradient-to-b from-primary/5 to-transparent"
                  : ""
              }`}
            >
              {plan.variant === "glow" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    Más Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-display font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === "Enterprise" ? "/contact" : "/register"} className="block">
                  <Button
                    variant={plan.variant === "glow" ? "glow" : "outline"}
                    className="w-full gap-2"
                  >
                    {plan.name === "Enterprise" ? "Contactar Ventas" : "Comenzar Gratis"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
