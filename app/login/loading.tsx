import { Card, CardContent } from "@/components/ui/card";

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <Card className="w-full max-w-md modern-card">
        <CardContent className="p-6 space-y-6">
          {/* Title Skeleton */}
          <div className="text-center space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse mx-auto" />
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-full bg-muted rounded animate-pulse" />
            </div>

            {/* Submit Button */}
            <div className="h-10 w-full bg-muted rounded animate-pulse" />

            {/* Link */}
            <div className="text-center">
              <div className="h-4 w-48 bg-muted rounded animate-pulse mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
