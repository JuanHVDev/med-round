"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Bell,
  Lock,
  FileCheck,
  UserCheck,
  Clock,
  BarChart3,
  Cloud,
  RefreshCw,
  ArrowRight,
  Activity
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Smartphone,
    title: "Acceso Móvil",
    description: "Consulta y actualiza información desde cualquier dispositivo móvil en tiempo real.",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20"
  },
  {
    icon: Bell,
    title: "Notificaciones Inteligentes",
    description: "Recibe alertas automáticas sobre tareas pendientes y cambios críticos.",
    color: "text-teal-400",
    gradient: "from-teal-500/20"
  },
  {
    icon: Lock,
    title: "Seguridad de Datos",
    description: "Cifrado de extremo a extremo y cumplimiento de normativas médicas.",
    color: "text-emerald-400",
    gradient: "from-emerald-500/20"
  },
  {
    icon: FileCheck,
    title: "Gestión de Tareas",
    description: "Organiza, prioriza y da seguimiento a todas las actividades médicas.",
    color: "text-violet-400",
    gradient: "from-violet-500/20"
  },
  {
    icon: UserCheck,
    title: "Control de Acceso",
    description: "Permisos granulares para diferentes roles médicos y administrativos.",
    color: "text-amber-400",
    gradient: "from-amber-500/20"
  },
  {
    icon: Clock,
    title: "Historial Completo",
    description: "Registro detallado de todas las acciones y cambios realizados.",
    color: "text-rose-400",
    gradient: "from-rose-500/20"
  }
];

const advancedFeatures = [
  {
    icon: BarChart3,
    title: "Análisis y Reportes",
    description: "Estadísticas detalladas sobre eficiencia del personal y gestión de tiempo."
  },
  {
    icon: Cloud,
    title: "Sincronización en la Nube",
    description: "Acceso instantáneo a la información actualizada desde cualquier lugar."
  },
  {
    icon: RefreshCw,
    title: "Integración Hospitalaria",
    description: "Compatible con los principales sistemas de gestión hospitalaria."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-primary/10 text-primary mb-4 hover:bg-primary/20">
            Funcionalidades Principales
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Todo lo que necesitas para una{" "}
            <span className="text-gradient">gestión eficiente</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            MedRound integra todas las herramientas necesarias para optimizar el pase de visita
            y la gestión de pendientes en tu centro médico.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            show: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="h-full group hover:border-primary/30 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-display font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-3xl p-8 md:p-12 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Funcionalidades Avanzadas
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Características premium para una gestión médica de máximo nivel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-background/50 hover:bg-background transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-6">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground mt-4 mb-2">
            ¿Listo para transformar tu gestión hospitalaria?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Únete a los hospitales que ya optimizaron sus procesos con MedRound
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button variant="glow" size="lg" className="gap-2">
                Solicitar Demo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="gap-2">
                Ver Funcionamiento
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
