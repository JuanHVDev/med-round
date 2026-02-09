import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificar Email",
  description: "Verifica tu correo electrónico para acceder a MedRound.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
