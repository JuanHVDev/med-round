import { Card, CardContent } from "@/components/ui/card";
import { MedRoundLogo } from "@/components/ui/med-round-logo";
import { Loader2 } from "lucide-react";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-primary/20 shadow-xl">
        <CardContent className="p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <MedRoundLogo size="lg" />
            </div>
            <div className="h-6 w-32 bg-primary/10 rounded animate-pulse mx-auto" />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-primary/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-primary/5 rounded animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-24 bg-primary/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-primary/5 rounded animate-pulse" />
            </div>

            <div className="h-10 w-full bg-primary/10 rounded animate-pulse" />

            <div className="text-center">
              <div className="h-4 w-40 bg-primary/5 rounded animate-pulse mx-auto" />
            </div>
          </div>

          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
