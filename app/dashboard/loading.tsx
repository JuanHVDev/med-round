import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="flex items-center space-x-4">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-9 w-28 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="modern-card">
            <CardHeader className="text-center space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse mx-auto" />
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
                <div className="h-4 w-64 bg-muted rounded animate-pulse mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
