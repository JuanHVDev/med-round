"use client";

import { useMemo } from "react";
import { structuredDataConfig } from "@/lib/config/seo";

interface StructuredDataProps {
  type: "organization" | "website" | "softwareApplication" | "breadcrumb";
  data?: {
    items?: Array<{ name: string; url: string }>;
    [key: string]: unknown;
  };
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const schema = useMemo(() => {
    switch (type) {
      case "organization":
        return structuredDataConfig.organization;
      case "website":
        return structuredDataConfig.website;
      case "softwareApplication":
        return structuredDataConfig.softwareApplication;
      case "breadcrumb":
        return data?.items
          ? {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: data.items.map(
                (item: { name: string; url: string }, index: number) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: item.name,
                  item: item.url,
                })
              ),
            }
          : null;
      default:
        return null;
    }
  }, [type, data]);

  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface UseStructuredDataReturn {
  organization: string;
  website: string;
  softwareApplication: string;
}

export function useStructuredData(): UseStructuredDataReturn {
  return {
    organization: JSON.stringify(structuredDataConfig.organization),
    website: JSON.stringify(structuredDataConfig.website),
    softwareApplication: JSON.stringify(structuredDataConfig.softwareApplication),
  };
}

export function OrganizationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredDataConfig.organization),
      }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredDataConfig.website),
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredDataConfig.softwareApplication),
      }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  openingHours: string[];
  priceRange?: string;
}

export function LocalBusinessSchema({ data }: { data: LocalBusinessSchemaProps }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
