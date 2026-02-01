"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isPending } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isPending) {
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isPending]);

  if (isPending || !isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}