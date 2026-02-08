"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CommandPalette } from "@/components/ui/CommandPalette";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayoutClient({ children, className }: DashboardLayoutClientProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          "lg:ml-64 ml-0",
          className
        )}
      >
        {children}
      </main>
      <CommandPalette />
    </div>
  );
}
