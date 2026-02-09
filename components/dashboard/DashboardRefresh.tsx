"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface DashboardStats {
  totalPatients: number;
  pendingTasks: number;
  criticalPatients: number;
  notesToday: number;
}

interface RecentPatient {
  id: string;
  name: string;
  bedNumber: string;
  lastVisit?: Date;
  condition?: string;
}

interface PendingTask {
  id: string;
  title: string;
  priority: "urgente" | "alta" | "media" | "baja";
  patientName: string;
  patientId: string;
  dueDate?: Date;
}

interface DashboardData {
  stats: DashboardStats;
  recentPatients: RecentPatient[];
  pendingTasks: PendingTask[];
}

interface DashboardRefreshProps {
  children: React.ReactNode;
  interval?: number;
}

export function DashboardRefresh({ children, interval = 30000 }: DashboardRefreshProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [fetchData, interval]);

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
}

const DashboardContext = createContext<DashboardData | null>(null);

export function useDashboardData() {
  return useContext(DashboardContext);
}
