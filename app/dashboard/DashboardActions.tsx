"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardActionsProps {
  userName: string;
}

export function DashboardActions({ userName }: DashboardActionsProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-muted-foreground">Hola, {userName}</span>
      <Button
        onClick={handleLogout}
        variant="destructive"
        size="sm"
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
}
