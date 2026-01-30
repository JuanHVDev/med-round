import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión - MedRound",
  description: "Accede a tu cuenta de MedRound. Gestiona el pase de visita y las tareas pendientes de tu equipo médico de forma segura.",
  keywords: ["login", "inicio sesión", "medround", "gestión médica"],
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
