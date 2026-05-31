import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function BookingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
      <Card>
        <div className="p-1">
          <div className="border-b px-4 py-3 grid grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b last:border-0 px-4 py-3 grid grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, j) => <Skeleton key={j} className="h-4" />)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
