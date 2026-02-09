import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { OrganizationJsonLd, WebsiteJsonLd, SoftwareApplicationJsonLd } from "@/components/seo/SEOHead";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MedRound - Asistente de Pase de Visita y Gestión Hospitalaria",
    template: "%s | MedRound",
  },
  description: "Software médico para gestión de pase de visita, pendientes médicos y comunicación entre turnos. Mejora la eficiencia de tu hospital.",
  keywords: [
    "software médico",
    "pase de visita",
    "gestión hospitalaria",
    "handoff médico",
    "pendientes médicos",
    "historia clínica",
    "software hospitalario",
    "notas SOAP",
    "gestión de pacientes",
    "salud digital",
  ],
  authors: [{ name: "MedRound Team" }],
  creator: "MedRound",
  publisher: "MedRound",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://medround.com"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://medround.com",
    siteName: "MedRound",
    title: "MedRound - Asistente de Pase de Visita y Gestión Hospitalaria",
    description: "Software médico para gestión de pase de visita, pendientes médicos y comunicación entre turnos.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MedRound - Software Médico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MedRound - Software Médico",
    description: "Gestiona pase de visita y pendientes médicos de forma eficiente",
    images: ["/og-image.svg"],
    creator: "@medround",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "GOOGLE-SITE-VERIFICATION-CODE",
  },
  category: "health",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
