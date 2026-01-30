import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro - MedRound",
  description: "Crea tu cuenta en MedRound. Únete a médicos y hospitales que optimizan el pase de visita y la gestión de pendientes.",
  keywords: ["registro", "signup", "medround", "médicos", "gestión hospitalaria"],
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
