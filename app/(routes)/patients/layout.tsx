import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Pacientes",
  description:
    "Sistema de gestión de pacientes para hospitales. Census, notas SOAP, historiales clínicos y seguimiento de pacientes.",
};

export default function PatientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
