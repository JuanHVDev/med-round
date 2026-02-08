"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  CheckSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION } from "@/lib/utils/constants";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  { href: NAVIGATION.DASHBOARD, label: "Dashboard", icon: Home },
  { href: NAVIGATION.PATIENTS, label: "Pacientes", icon: Users },
  { href: NAVIGATION.TASKS, label: "Tareas", icon: CheckSquare },
  { href: NAVIGATION.HANDOVER, label: "Entrega de Guardia", icon: FileText },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-950 rounded-lg shadow-md"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r transition-all duration-300",
          "dark:bg-slate-950 dark:border-slate-800",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b dark:border-slate-800">
          {!collapsed && (
            <Link href={NAVIGATION.DASHBOARD} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MR</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                MedRound
              </span>
            </Link>
          )}
          <button
            className={cn(
              "p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800",
              "hidden lg:flex"
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-colors duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                  collapsed && "justify-center"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-2 py-4 space-y-1 dark:border-slate-800">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configuración</span>}
          </Link>

          <button
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {mobileOpen && (
          <button
            className="lg:hidden absolute top-4 right-[-40px] p-2 bg-white dark:bg-slate-950 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
