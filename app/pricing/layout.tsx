import type { Metadata } from "next";
import { PricingJsonLd } from "@/components/seo/SEOHead";

export const metadata: Metadata = {
  title: "Precios",
  description: "Planes y precios de MedRound. Encuentra el plan perfecto para tu hospital o equipo médico.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultPlans = [
    {
      name: "Básico",
      price: "0",
      currency: "USD",
      unit: "MONTH",
      description: "Para médicos individuales",
      features: ["Gestión de pacientes", "Notas SOAP", "Tareas básicas"],
    },
    {
      name: "Profesional",
      price: "29",
      currency: "USD",
      unit: "MONTH",
      description: "Para equipos pequeños",
      features: ["Todo lo del Básico", "Handoffs ilimitados", "Reportes avanzados"],
    },
  ];

  return (
    <>
      <PricingJsonLd plans={defaultPlans} />
      {children}
    </>
  );
}
