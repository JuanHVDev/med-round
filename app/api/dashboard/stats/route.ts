import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dashboardService } from "@/services";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospital = session.user?.email?.includes("@hospital1")
      ? "Hospital General"
      : undefined;

    const [stats, recentPatients, pendingTasks] = await Promise.all([
      dashboardService.getStats(hospital),
      dashboardService.getRecentPatients(hospital),
      dashboardService.getPendingTasks(hospital),
    ]);

    return NextResponse.json({ stats, recentPatients, pendingTasks });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Error fetching dashboard data" },
      { status: 500 }
    );
  }
}
