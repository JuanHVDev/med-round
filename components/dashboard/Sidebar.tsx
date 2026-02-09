"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
import { signOut } from "@/lib/auth-client";
import { useSession } from "@/lib/auth-client";

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
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      <button
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-card rounded-xl shadow-lg border border-primary/20"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-r border-primary/10 transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className={cn(
          "flex items-center px-4 border-b border-primary/10",
          collapsed ? "justify-center py-4" : "h-16 justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xs">MR</span>
              </div>
              <span className="font-semibold font-display text-foreground text-sm">
                Menú
              </span>
            </div>
          )}
          {collapsed && (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">MR</span>
            </div>
          )}
          <button
            className={cn(
              "p-1.5 rounded-lg hover:bg-primary/10 transition-colors",
              "hidden lg:flex",
              collapsed && "absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-primary/20 rounded-full"
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

        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                  "transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                  collapsed && "justify-center"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-primary/10 px-2 py-3 space-y-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-muted-foreground hover:bg-primary/5 hover:text-foreground transition-colors",
              collapsed && "justify-center"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Configuración</span>}
          </Link>

          <button
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
              "text-muted-foreground hover:bg-primary/5 hover:text-foreground transition-colors",
              collapsed && "justify-center"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>

        {!collapsed && session?.user && (
          <div className="px-3 py-3 border-t border-primary/10">
            <div className="flex items-center gap-3 px-2 py-1.5">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xs">
                  {session.user.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {session.user.name || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {mobileOpen && (
          <button
            className="lg:hidden absolute top-4 right-[-40px] p-2 bg-card rounded-xl border border-primary/20"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
