import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro",
  description: "Crea tu cuenta de MedRound y empieza a gestionar pacientes, handoffs y tareas médicas de forma eficiente.",
  keywords: ["registro", "signup", "crear cuenta", "medround", "software médico", "médicos"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Registro - MedRound",
    description: "Crea tu cuenta en MedRound",
    type: "website",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
