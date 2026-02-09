"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ShimmerSkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
}

export function ShimmerSkeleton({
  className,
  variant = "rectangular",
}: ShimmerSkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  }

  return (
    <motion.div
      animate={{
        backgroundPosition: ["0% 0%", "100% 0%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
      className={cn(
        "bg-gradient-to-r from-secondary via-primary/10 to-secondary",
        "bg-[length:200%_100%]",
        variants[variant],
        className
      )}
    />
  )
}
