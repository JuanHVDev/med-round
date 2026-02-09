export const siteConfig = {
  name: "MedRound",
  description: "Software médico para gestión de pase de visita, pendientes médicos y comunicación entre turnos",
  url: "https://medround.com",
  supportEmail: "soporte@medround.com",
  defaultTitle: "MedRound - Asistente de Pase de Visita y Gestión Hospitalaria",
  ogImage: "/og-image.svg",
  twitterHandle: "@medround",
} as const;

export const seoConfig = {
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
    "médicos",
    "enfermería",
    "hospital",
    "clínica",
    "atención médica",
  ],
  categories: ["health", "medical", "healthcare", "software"],
  locality: "es",
  country: "ES",
};

export const robotsRules = {
  indexablePaths: ["/", "/about", "/contact", "/pricing"],
  noindexPaths: [
    "/dashboard",
    "/patients",
    "/handover",
    "/tasks",
    "/login",
    "/register",
    "/verify-email",
    "/api",
  ],
  noimageindexPaths: ["/dashboard", "/patients", "/private"],
};

export const structuredDataConfig = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MedRound",
    url: "https://medround.com",
    logo: "https://medround.com/logo.svg",
    sameAs: [
      "https://twitter.com/medround",
      "https://linkedin.com/company/medround",
      "https://facebook.com/medround",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"],
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MedRound",
    url: "https://medround.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://medround.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MedRound",
    applicationCategory: "MedicalApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: {
      "@type": "Organization",
      name: "MedRound",
    },
  },
};

export const socialConfig = {
  og: {
    siteName: "MedRound",
    type: "website",
    locale: "es_ES",
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
    site: "@medround",
    creator: "@medround",
  },
};

export const analyticsConfig = {
  gaId: "GA-MEASUREMENT-ID",
  gtmId: "GTM-TRACKING-ID",
};

export type SiteConfig = typeof siteConfig;
export type SEOConfig = typeof seoConfig;
export type RobotsRules = typeof robotsRules;
