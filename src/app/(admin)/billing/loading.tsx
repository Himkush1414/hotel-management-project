import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex gap-3 flex-wrap">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Card>
        <div className="p-1">
          <div className="border-b px-4 py-3 grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-4" />)}
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b last:border-0 px-4 py-3 grid grid-cols-7 gap-4 items-center">
              {Array.from({ length: 7 }).map((_, j) => <Skeleton key={j} className="h-4" />)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
