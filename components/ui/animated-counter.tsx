"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: "number" | "percent" | "currency"
  suffix?: string
  prefix?: string
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1500,
  format = "number",
  suffix,
  prefix,
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const startValue = displayValue
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * easeOut

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  const formattedValue = () => {
    if (format === "percent") {
      return `${Math.round(displayValue)}%`
    }
    if (format === "currency") {
      return `$${Math.round(displayValue).toLocaleString()}`
    }
    return Math.round(displayValue).toLocaleString()
  }

  return (
    <span className={cn("tabular-nums font-mono font-bold", className)}>
      {prefix}{formattedValue()}{suffix}
    </span>
  )
}
