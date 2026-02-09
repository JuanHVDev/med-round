"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FilePlus,
  Search,
  Calendar,
  ClipboardList,
  Pill,
  AlertCircle,
} from "lucide-react"

const actions = [
  { icon: FilePlus, label: "Nuevo Paciente", color: "text-cyan-400", gradient: "from-cyan-500/20" },
  { icon: Search, label: "Buscar", color: "text-teal-400", gradient: "from-teal-500/20" },
  { icon: Calendar, label: "Agendar", color: "text-violet-400", gradient: "from-violet-500/20" },
  { icon: ClipboardList, label: "Handover", color: "text-amber-400", gradient: "from-amber-500/20" },
  { icon: Pill, label: "Medicamentos", color: "text-emerald-400", gradient: "from-emerald-500/20" },
  { icon: AlertCircle, label: "Alertas", color: "text-red-400", gradient: "from-red-500/20" },
] as const

export function QuickActions() {
  return (
    <Card className="p-6">
      <motion.h3
        className="font-display font-semibold text-lg mb-4"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Acciones Rápidas
      </motion.h3>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.05 }}
          >
            <Button
              variant="ghost"
              className={`w-full h-16 flex flex-col gap-1.5 hover:bg-gradient-to-br ${action.gradient} ${action.color} transition-all duration-300`}
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <action.icon className="w-5 h-5" />
              </motion.div>
              <span className="text-xs">{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </Card>
  )
}
