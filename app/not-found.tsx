"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, Activity } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="text-9xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            404
          </motion.div>

          <motion.h1
            className="text-3xl font-display font-semibold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Página No Encontrada
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Lo sentimos, la página que buscas no existe o ha sido movida.
            Pero no te preocupes, podemos ayudarte a encontrar lo que necesitas.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/">
            <Button variant="glow" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              Ir al Inicio
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="w-5 h-5" />
              Contactar Soporte
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="pt-8 border-t border-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-sm text-muted-foreground mb-4">¿Buscas información sobre?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/#features"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Características
            </Link>
            <span className="text-primary/20">|</span>
            <Link
              href="/pricing"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Precios
            </Link>
            <span className="text-primary/20">|</span>
            <Link
              href="/about"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Sobre Nosotros
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>© 2026 MedRound. Software médico para gestión hospitalaria.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
