import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { RoomStatus } from '@/types/room'

const BADGE_CONFIG: Record<RoomStatus, { label: string; className: string }> = {
  available:   { label: 'Available',   className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
  occupied:    { label: 'Occupied',    className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'               },
  cleaning:    { label: 'Cleaning',    className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300'           },
  maintenance: { label: 'Maintenance', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'                     },
  blocked:     { label: 'Blocked',      className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300'                 },
}

interface RoomStatusBadgeProps {
  status: RoomStatus
  className?: string
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const cfg = BADGE_CONFIG[status] ?? BADGE_CONFIG.available
  return (
    <Badge variant="outline" className={cn(cfg.className, className)}>
      {cfg.label}
    </Badge>
  )
}
