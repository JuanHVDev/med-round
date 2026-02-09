import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta de MedRound para gestionar pacientes, handoffs y tareas médicas de forma segura.",
  keywords: ["iniciar sesión", "login", "acceso", "medround", "software médico"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Iniciar Sesión - MedRound",
    description: "Accede a tu cuenta de MedRound",
    type: "website",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
