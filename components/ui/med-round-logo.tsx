"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MedRoundLogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MedRoundLogo({ size = "md", className }: MedRoundLogoProps) {
  const sizes = {
    sm: { logo: 28, text: "text-lg", icon: "w-5 h-5" },
    md: { logo: 40, text: "text-2xl", icon: "w-6 h-6" },
    lg: { logo: 56, text: "text-4xl", icon: "w-8 h-8" },
  }

  const { logo, text, icon } = sizes[size]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400"
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ padding: "2px" }}
        />
        <div className="relative w-10 h-10 rounded-xl bg-card flex items-center justify-center overflow-hidden">
          <motion.svg
            width={logo}
            height={logo}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={icon}
          >
            <motion.path
              d="M12 2L12 22M2 12L22 12"
              stroke="url(#logoGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
      </motion.div>

      <div className="flex flex-col">
        <motion.span
          className={cn(
            "font-display font-bold tracking-tight leading-none",
            text
          )}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Med<span className="text-primary">Round</span>
        </motion.span>
        <motion.span
          className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Clinical Intelligence
        </motion.span>
      </div>
    </div>
  )
}
