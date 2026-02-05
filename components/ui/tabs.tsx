"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<HTMLDivElement, {
  defaultValue?: string
  className?: string
  children: React.ReactNode
}>(({ className, defaultValue, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full", className)}
    data-default-value={defaultValue}
    {...props}
  >
    {children}
  </div>
))
Tabs.displayName = "Tabs"

export { Tabs }

const TabsContent = React.forwardRef<HTMLDivElement, {
  className?: string
  children: React.ReactNode
}>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </div>
))
TabsContent.displayName = "TabsContent"

const TabsList = React.forwardRef<HTMLDivElement, {
  className?: string
  children: React.ReactNode
}>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<HTMLButtonElement, {
  className?: string
  children: React.ReactNode
}>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("", className)}
    {...props}
  >
    {children}
  </button>
))
TabsTrigger.displayName = "TabsTrigger"

export { TabsContent, TabsList, TabsTrigger }