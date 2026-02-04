"use client"

import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef<
  React.HTMLAttributes<HTMLDivElement>,
  {
    className?: string
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-slate-100", className)}
    {...props}
  >
    {children}
  </div>
))
Skeleton.displayName = "Skeleton"

export { Skeleton }