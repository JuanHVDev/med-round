"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import {
  Users,
  CalendarClock,
  Activity,
  ClipboardCheck,
} from "lucide-react"

interface DashboardStats {
  totalPatients: number;
  pendingTasks: number;
  criticalPatients: number;
  notesToday: number;
}

interface StatCardProps {
  label: string
  value: number
  suffix?: string
  icon: React.ElementType
  color: string
  gradient: string
  delay: number
}

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  color,
  gradient,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100, damping: 15 }}
    >
      <Card className="relative overflow-hidden p-6 h-full">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} ${color}`}
            >
              <Icon className="w-5 h-5" />
            </span>
            <motion.div
              className={`w-2 h-2 rounded-full ${color.replace("text-", "bg-")}`}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay }}
            />
          </div>

          <AnimatedCounter
            value={value}
            suffix={suffix}
            className={`text-4xl ${color}`}
          />
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </Card>
    </motion.div>
  )
}

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statsData = [
    {
      label: "Pacientes Activos",
      value: stats.totalPatients,
      icon: Users,
      color: "text-cyan-400",
      gradient: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      label: "Notas Hoy",
      value: stats.notesToday,
      icon: CalendarClock,
      color: "text-teal-400",
      gradient: "from-teal-500/20 to-teal-500/05",
    },
    {
      label: "Signos Críticos",
      value: stats.criticalPatients,
      icon: Activity,
      color: "text-amber-400",
      gradient: "from-amber-500/20 to-amber-500/5",
    },
    {
      label: "Tareas Pendientes",
      value: stats.pendingTasks,
      icon: ClipboardCheck,
      color: "text-violet-400",
      gradient: "from-violet-500/20 to-violet-500/5",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      }}
    >
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.label}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </motion.div>
  )
}
