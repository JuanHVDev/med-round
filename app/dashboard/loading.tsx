export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center space-x-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
