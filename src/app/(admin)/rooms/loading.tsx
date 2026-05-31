import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function RoomsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Status count cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pb-4 pt-5 text-center space-y-2">
              <Skeleton className="mx-auto h-9 w-10" />
              <Skeleton className="mx-auto h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Floor sections */}
      {Array.from({ length: 3 }).map((_, fi) => (
        <div key={fi} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-px flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, ri) => (
              <Card key={ri} className="overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-6 w-12" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 px-3 pb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
