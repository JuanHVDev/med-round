"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<HTMLDivElement, {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}>(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full", className)}
    data-default-value={defaultValue}
    data-value={value}
    {...props}
  >
    {children}
  </div>
))
Tabs.displayName = "Tabs"

const TabsContent = React.forwardRef<HTMLDivElement, {
  value?: string
  className?: string
  children: React.ReactNode
}>(({ className, value, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    data-tab-value={value}
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
  value?: string
  className?: string
  children: React.ReactNode
}>(({ className, value, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("", className)}
    data-tab-value={value}
    {...props}
  >
    {children}
  </button>
))
TabsTrigger.displayName = "TabsTrigger"

export { TabsContent, TabsList, TabsTrigger, Tabs }
