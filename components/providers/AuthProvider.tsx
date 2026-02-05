"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface AuthContextType
{
  session: {
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null;
    };
    session: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      expiresAt: Date;
      token: string;
      ipAddress?: string | null;
      userAgent?: string | null;
    };
  } | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth()
{
  const context = useContext(AuthContext);
  if (context === undefined)
  {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps
{
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps)
{
  const { data: session, isPending: loading } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() =>
  {
    if (!loading)
    {
      const timer = setTimeout(() =>
      {
        setIsInitialized(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || !isInitialized)
  {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Iniciando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}