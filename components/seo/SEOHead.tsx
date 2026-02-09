"use client";

import { useMemo } from "react";
import { siteConfig } from "@/lib/config/seo";

export function OrganizationJsonLd() {
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/logo.svg`,
        sameAs: [
          "https://twitter.com/medround",
          "https://linkedin.com/company/medround",
          "https://facebook.com/medround",
          "https://instagram.com/medround",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-555-123-4567",
          contactType: "customer service",
          availableLanguage: ["Spanish", "English"],
          areaServed: ["Worldwide"],
        },
        description: siteConfig.description,
        foundingDate: "2024",
        industry: "Healthcare Technology",
      }),
    []
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }),
    []
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "MedicalApplication",
        operatingSystem: "Web, iOS, Android",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        description:
          "Software médico para gestión de pase de visita, pendientes médicos y comunicación entre turnos",
        featureList: [
          "Gestión de pacientes",
          "Notas SOAP",
          "Handoffs médicos",
          "Tareas pendientes",
          "Comunicación entre turnos",
          "Reportes y estadísticas",
        ],
        screenshot: `${siteConfig.url}/screenshot.png`,
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
        },
        author: {
          "@type": "Organization",
          name: siteConfig.name,
        },
      }),
    []
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }),
    [items]
  );

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

interface FAQJsonLdProps {
  items: FAQItem[];
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
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
      }),
    [items]
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  ogImage?: string;
}

export function SEOHead({
  title,
  description,
  ogImage,
}: SEOHeadProps) {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <SoftwareApplicationJsonLd />
    </>
  );
}

export function DefaultSEO() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <SoftwareApplicationJsonLd />
    </>
  );
}

interface PricingPlan {
  name: string;
  price: string;
  currency: string;
  unit: string;
  description: string;
  features: string[];
}

interface PricingJsonLdProps {
  plans: PricingPlan[];
}

export function PricingJsonLd({ plans }: PricingJsonLdProps) {
  const offers = plans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price,
    priceCurrency: plan.currency,
    priceUnitCode: plan.unit,
    description: plan.description,
    availability: "https://schema.org/InStock",
    validFrom: "2024-01-01",
    eligibleRegion: {
      "@type": "Place",
      name: ["Worldwide", "España", "Latinoamérica"],
    },
  }));

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Planes y Precios - MedRound",
    description: "Planes y precios de MedRound para hospitales y equipos médicos",
    url: "https://medround.com/pricing",
    mainEntity: {
      "@type": "OfferCatalog",
      name: "Planes de MedRound",
      itemListElement: offers,
    },
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function ContactJsonLd() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Contacto - MedRound",
    description: "Contacta con el equipo de MedRound para consultas sobre nuestro software médico",
    url: "https://medround.com/contact",
    mainEntity: {
      "@type": "ContactPage",
      name: "Contacto",
    },
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}

export function AboutJsonLd() {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre Nosotros - MedRound",
    description: "Conoce la historia de MedRound y nuestra misión de mejorar la atención médica a través de la tecnología",
    url: "https://medround.com/about",
    mainEntity: {
      "@type": "Organization",
      name: "MedRound",
      url: "https://medround.com",
    },
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
