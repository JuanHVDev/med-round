import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-primary/10" />
          <Skeleton className="h-4 w-32 bg-primary/10" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card/50 border-primary/10 p-6">
            <Skeleton className="h-4 w-24 mb-4 bg-primary/10" />
            <Skeleton className="h-8 w-16 mb-2 bg-primary/10" />
            <Skeleton className="h-3 w-32 bg-primary/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card/50 border-primary/10 p-6">
          <Skeleton className="h-6 w-40 mb-4 bg-primary/10" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-primary/10" />
            ))}
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card/50 border-primary/10 p-6">
          <Skeleton className="h-6 w-32 mb-4 bg-primary/10" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-primary/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
