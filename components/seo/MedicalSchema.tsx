"use client";

export function MedicalWebPageJsonLd() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "MedRound - Software Médico",
    description:
      "Software médico para gestión de pase de visita, pendientes médicos y comunicación entre turnos",
    url: "https://medround.com",
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "MedRound",
      applicationCategory: "MedicalApplication",
      operatingSystem: "Web, iOS, Android",
    },
    audience: {
      "@type": "MedicalAudience",
      audienceType: ["MedicalProfessional", "HealthCareProvider"],
    },
    medicalSpecialty: [
      "General Medicine",
      "Hospital Medicine",
      "Nursing",
    ],
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function MedicalOrganizationJsonLd() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: "MedRound",
    url: "https://medround.com",
    logo: "https://medround.com/logo.svg",
    description:
      "MedRound desarrolla software médico para mejorar la gestión hospitalaria y la comunicación entre profesionales de la salud",
    foundingDate: "2024",
    areaServed: ["Worldwide", "España", "Latinoamérica"],
    medicalSpecialty: [
      "General Medicine",
      "Hospital Medicine",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      availableLanguage: ["Spanish", "English"],
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
    sameAs: [
      "https://twitter.com/medround",
      "https://linkedin.com/company/medround",
      "https://facebook.com/medround",
    ],
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function MedicalFAQJsonLd({ items }: { items: FAQItem[] }) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function HowToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
}) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime: "PT5M",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function VideoObjectJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
}: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
}) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    publisher: {
      "@type": "Organization",
      name: "MedRound",
      logo: {
        "@type": "ImageObject",
        url: "https://medround.com/logo.svg",
      },
    },
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
