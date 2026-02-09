"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Greeting {
  text: string
  icon: string
  phase: "morning" | "afternoon" | "night"
}

const greetings: Greeting[] = [
  { text: "Buenos días", icon: "🌅", phase: "morning" },
  { text: "Buenas tardes", icon: "☀️", phase: "afternoon" },
  { text: "Buenas noches", icon: "🌙", phase: "night" },
]

export function DashboardHeader() {
  const [hour] = useState(() => new Date().getHours())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const greeting = hour < 12 ? greetings[0] : hour < 18 ? greetings[1] : greetings[2]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="flex items-center gap-4">
        <motion.span
          className="text-4xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {greeting.icon}
        </motion.span>

        <div>
          <motion.h1
            className="text-4xl font-display font-bold tracking-tight text-foreground"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {greeting.text}, Doctor
          </motion.h1>
          <motion.p
            className="text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: mounted ? 1 : 0 }}
            transition={{ delay: 0.35 }}
          >
            Aquí está el resumen de tu turno
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
