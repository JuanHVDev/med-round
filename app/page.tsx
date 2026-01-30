import dynamic from "next/dynamic";
import { Suspense } from "react";
import HeroSection from "@/components/hero-section";

// Dynamic imports for below-the-fold sections
const FeaturesSection = dynamic(() => import("@/components/features-section"), {
  loading: () => (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  ),
});

const ProblemSolutionSection = dynamic(
  () => import("@/components/problem-solution-section"),
  {
    loading: () => (
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

const Footer = dynamic(() => import("@/components/footer"), {
  loading: () => (
    <div className="bg-gray-900 h-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-16">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  ),
});

export const metadata = {
  title: "MedRound - Asistente de Pase de Visita y Gestión de Pendientes",
  description: "Transforma la gestión de tareas y el traspaso de información entre turnos médicos. Termina con los papeles perdidos y mejora la comunicación en tu hospital.",
  keywords: "pase de visita, gestión hospitalaria, handoff médico, pendientes médicos, software médico",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <Suspense>
        <FeaturesSection />
      </Suspense>
      <Suspense>
        <ProblemSolutionSection />
      </Suspense>
      <Suspense>
        <Footer />
      </Suspense>
    </main>
  );
}
