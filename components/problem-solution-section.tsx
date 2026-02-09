"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  FileX,
  Clock,
  Users,
  CheckCircle,
  Shield,
  Smartphone,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const problems = [
  {
    icon: FileX,
    title: "Pérdida de Información",
    description: "Papeles sueltos que se extravían con datos críticos del paciente",
    color: "text-red-400",
    gradient: "from-red-500/20"
  },
  {
    icon: Clock,
    title: "Retrasos en Handoffs",
    description: "Procesos manuales que consumen tiempo valioso del personal médico",
    color: "text-amber-400",
    gradient: "from-amber-500/20"
  },
  {
    icon: Users,
    title: "Comunicación Ineficiente",
    description: "Falta de estandarización en el traspaso entre turnos",
    color: "text-yellow-400",
    gradient: "from-yellow-500/20"
  }
];

const solutions = [
  {
    icon: CheckCircle,
    title: "Información Centralizada",
    description: "Toda la data segura y accesible en un solo lugar digital",
    color: "text-emerald-400",
    gradient: "from-emerald-500/20"
  },
  {
    icon: Shield,
    title: "Procesos Optimizados",
    description: "Flujos de trabajo automatizados que ahorran hasta 75% del tiempo",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20"
  },
  {
    icon: Smartphone,
    title: "Acceso Instantáneo",
    description: "Disponibilidad 24/7 desde cualquier dispositivo móvil",
    color: "text-violet-400",
    gradient: "from-violet-500/20"
  }
];

export default function ProblemSolutionSection() {
  const [activeTab, setActiveTab] = useState<"problem" | "solution">("solution");

  return (
    <section id="problem-solution" className="py-24 bg-background relative">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 mb-4">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Problema vs Solución
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            De los papeles perdidos a la{" "}
            <span className="text-gradient">gestión digital</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre cómo MedRound transforma los mayores desafíos del pase de visita
            en oportunidades de eficiencia.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex rounded-xl border border-primary/20 bg-card p-1 shadow-lg">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "problem"
                  ? "bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Problemas Actuales
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "solution"
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Soluciones MedRound
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <AnimatePresence mode="wait">
            {activeTab === "problem" && (
              <motion.div
                key="problems"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-amber-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    Desafíos Hospitalarios
                  </h3>
                </div>

                {problems.map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${problem.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <problem.icon className={`w-6 h-6 ${problem.color}`} />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              {problem.title}
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                              {problem.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "solution" && (
              <motion.div
                key="solutions"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    Soluciones MedRound
                  </h3>
                </div>

                {solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${solution.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <solution.icon className={`w-6 h-6 ${solution.color}`} />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              {solution.title}
                            </h4>
                            <p className="text-muted-foreground leading-relaxed">
                              {solution.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="bg-gradient-to-br from-primary via-primary to-accent rounded-3xl p-8 md:p-12 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">75%</div>
              <div className="text-white/70">Reducción en tiempo de handoff</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">100%</div>
              <div className="text-white/70">Recuperación de información</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-display font-bold mb-2">24/7</div>
              <div className="text-white/70">Disponibilidad del sistema</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-display font-bold text-foreground mb-4">
            ¿Listo para resolver estos problemas?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transforma la gestión de tu hospital y mejora la calidad del cuidado médico
          </p>
          <Link href="/contact">
            <Button variant="glow" size="lg" className="gap-2">
              Iniciar Transformación
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
