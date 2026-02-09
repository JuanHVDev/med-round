import type { Metadata } from "next";
import { ContactJsonLd } from "@/components/seo/SEOHead";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta con el equipo de MedRound. Estamos aquí para ayudarte a implementar nuestro software médico en tu hospital.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ContactJsonLd />
      {children}
    </>
  );
}
