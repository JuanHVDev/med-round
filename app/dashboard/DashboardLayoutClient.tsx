"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { AuthenticatedNavbar } from "@/components/dashboard/AuthenticatedNavbar";
import { CommandPalette } from "@/components/ui/CommandPalette";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayoutClient({ children, className }: DashboardLayoutClientProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AuthenticatedNavbar />
      <div className="flex">
        <Sidebar />
        <main
          className={cn(
            "flex-1 pt-16 transition-all duration-300",
            "lg:pl-64 pl-0",
            className
          )}
        >
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
