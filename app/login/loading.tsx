export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Title Skeleton */}
        <div className="text-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Form Skeleton */}
        <div className="mt-8 space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Submit Button */}
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />

          {/* Link */}
          <div className="text-center">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
