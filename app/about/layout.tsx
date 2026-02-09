import type { Metadata } from "next";
import { AboutJsonLd } from "@/components/seo/SEOHead";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Conoce la historia de MedRound y nuestra misión de mejorar la atención médica a través de la tecnología.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AboutJsonLd />
      {children}
    </>
  );
}
