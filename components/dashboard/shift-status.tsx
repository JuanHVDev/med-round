"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

type Shift = {
  label: string
  start: number
  end: number
}

const SHIFTS: Shift[] = [
  { label: "06:00 - 14:00", start: 6, end: 14 },
  { label: "14:00 - 22:00", start: 14, end: 22 },
  { label: "22:00 - 06:00", start: 22, end: 6 },
]

function getCurrentShift(shifts: Shift[]): Shift {
  const now = new Date()
  const currentHour = now.getHours()

  for (const shift of shifts) {
    if (shift.start < shift.end) {
      if (currentHour >= shift.start && currentHour < shift.end) {
        return shift
      }
    } else {
      if (currentHour >= shift.start || currentHour < shift.end) {
        return shift
      }
    }
  }

  return shifts[0]
}

export function ShiftStatus() {
  const [currentShift, setCurrentShift] = useState<Shift>(SHIFTS[0])
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false }))
      setCurrentShift(getCurrentShift(SHIFTS))
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 15 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/30 p-6"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/15 to-transparent"
        animate={{
          y: ["-100%", "100%"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="absolute inset-4 border border-primary/20 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-0 border-2 border-t-primary border-r-cyan-400 border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Turno activo</p>
          <motion.h3
            className="text-2xl font-display font-bold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {currentShift.label}
          </motion.h3>
          <p className="text-xs text-muted-foreground mt-1">{currentTime}</p>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="absolute inset-0 bg-emerald-400 rounded-full blur-md"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="relative w-3 h-3 rounded-full bg-emerald-400" />
          </motion.div>
          <span className="text-emerald-400 font-medium text-sm">En vivo</span>
        </div>
      </div>
    </motion.div>
  )
}
