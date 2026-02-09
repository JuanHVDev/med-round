import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description: "Conoce la historia de MedRound y nuestro missão de mejorar la atención médica a través de la tecnología.",
};

const stats = [
  { icon: Users, value: "500+", label: "Hospitales", color: "text-cyan-400", gradient: "from-cyan-500/20" },
  { icon: Activity, value: "10,000+", label: "Médicos", color: "text-teal-400", gradient: "from-teal-500/20" },
  { icon: Heart, value: "1M+", label: "Pacientes gestionados", color: "text-violet-400", gradient: "from-violet-500/20" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-24 relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary mb-4">
            Sobre MedRound
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Nuestra Misión
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Somos un equipo de profesionales dedicados a transformar la gestión hospitalaria
            a través de tecnología innovadora.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
              Tecnologia que Salva Vidas
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                En MedRound, creemos que la tecnología puede salvar vidas. Nuestra misión es
                simplificar la comunicación entre profesionales de la salud, reduciendo errores
                y mejorando la continuidad de la atención médica.
              </p>
              <p>
                Desarrollamos software intuitivo que se adapta a los flujos de trabajo de
                los médicos y hospitales, no al revés.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl h-64 flex items-center justify-center border border-primary/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <p className="text-muted-foreground">Imagen del equipo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-8 text-center">
              <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <p className="text-4xl font-display font-bold text-foreground mb-2">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
