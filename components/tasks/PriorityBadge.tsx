"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
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

  return (
    <span className={cn(priorityVariants({ variant }), className)}>
      {labels[variant || "MEDIUM"]}
    </span>
  );
}
