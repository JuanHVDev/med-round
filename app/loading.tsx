import type { Metadata } from "next";
import { MedRoundLogo } from "@/components/ui/med-round-logo";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Cargando...",
  description: "Cargando contenido de MedRound.",
};

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <MedRoundLogo className="h-12 w-12 mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 mx-auto bg-primary/10" />
          <Skeleton className="h-4 w-32 mx-auto bg-primary/10" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-8 w-24 rounded-full bg-primary/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
