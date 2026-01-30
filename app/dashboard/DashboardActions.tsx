"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

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
      <span className="text-sm text-gray-700">Hola, {userName}</span>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}
