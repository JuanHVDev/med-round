import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AuthenticatedNavbar } from "@/components/dashboard/AuthenticatedNavbar";
import { CommandPalette } from "@/components/ui/CommandPalette";

export const metadata: Metadata = {
  title: "Dashboard - MedRound",
  description: "Panel de control de MedRound",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AuthenticatedNavbar />
      <main className="pt-16">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
