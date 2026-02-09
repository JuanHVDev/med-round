"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentPatients } from "@/components/dashboard/RecentPatients";
import { PendingTasks } from "@/components/dashboard/PendingTasks";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ShiftStatus } from "@/components/dashboard/shift-status";
import { DashboardRefresh, useDashboardData } from "@/components/dashboard/DashboardRefresh";
import { getClientSession } from "@/lib/client-auth";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function DashboardContent() {
  const data = useDashboardData();
  if (!data) return null;

  return (
    <>
      <StatsGrid stats={data.stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentPatients patients={data.recentPatients} />
          <PendingTasks tasks={data.pendingTasks} />
        </div>
        <div className="space-y-6">
          <ShiftStatus />
          <QuickActions />
        </div>
      </div>
    </>
  );
}

function DashboardLoading() {
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

export default function DashboardPage({ searchParams }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<unknown>(null);

  useEffect(() => {
    getClientSession().then((s: any) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
        <div className="relative z-10 p-6 space-y-6">
          <DashboardHeader />
          <DashboardLoading />
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="relative z-10 p-6 space-y-6">
        <DashboardHeader />

        <DashboardRefresh interval={30000}>
          <DashboardContent />
        </DashboardRefresh>
      </div>
    </div>
  );
}
