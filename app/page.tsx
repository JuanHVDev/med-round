import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import ProblemSolutionSection from "@/components/problem-solution-section";
import Footer from "@/components/footer";

export const metadata = {
  title: "MedRound - Asistente de Pase de Visita y Gestión de Pendientes",
  description: "Transforma la gestión de tareas y el traspaso de información entre turnos médicos. Termina con los papeles perdidos y mejora la comunicación en tu hospital.",
  keywords: "pase de visita, gestión hospitalaria, handoff médico, pendientes médicos, software médico",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ProblemSolutionSection />
      <Footer />
    </main>
  );
}
