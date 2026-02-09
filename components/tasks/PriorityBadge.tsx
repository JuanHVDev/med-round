"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        URGENT: "bg-red-500/10 text-red-400 border border-red-500/20",
        HIGH: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        MEDIUM: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        LOW: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      },
    },
    defaultVariants: {
      variant: "MEDIUM",
    },
  }
);

export interface PriorityBadgeProps
  extends VariantProps<typeof priorityVariants> {
  className?: string;
}

export function PriorityBadge({ variant, className }: PriorityBadgeProps) {
  const labels = {
    URGENT: "Urgente",
    HIGH: "Alta",
    MEDIUM: "Media",
    LOW: "Baja",
  };

  const dots = {
    URGENT: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-amber-500",
    LOW: "bg-emerald-500",
  };

  return (
    <span className={cn(priorityVariants({ variant }), className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[variant || "MEDIUM"])} />
      {labels[variant || "MEDIUM"]}
    </span>
  );
}
