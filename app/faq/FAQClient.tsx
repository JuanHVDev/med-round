"use client";

import { MedicalFAQJsonLd } from "@/components/seo/MedicalSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQClientProps {
  items: FAQItem[];
}

function FAQItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 border-primary/10",
        isOpen ? "bg-card/80 backdrop-blur-sm" : "bg-card/50"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg font-medium pr-4">{item.question}</CardTitle>
        {isOpen ? (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ChevronUp className="h-4 w-4 text-primary" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0">
            <ChevronDown className="h-4 w-4 text-primary/60" />
          </div>
        )}
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0 pb-4">
          <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
        </CardContent>
      )}
    </Card>
  );
}

export function FAQClient({ items }: FAQClientProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <MedicalFAQJsonLd items={items} />
      <div className="min-h-screen py-20 relative overflow-hidden">
        <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary mb-4 border-primary/20">
              Preguntas Frecuentes
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Resuelve tus Dudas
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Encuentra respuestas a las preguntas más comunes sobre MedRound
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <FAQItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>

          <div className="mt-12 text-center p-6 bg-card/50 border border-primary/10 rounded-xl backdrop-blur-sm">
            <p className="text-muted-foreground mb-4">¿No encontraste tu respuesta?</p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
