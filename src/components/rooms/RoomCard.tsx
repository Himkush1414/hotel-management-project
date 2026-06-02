'use client'

import { useState } from 'react'
import { MoreVertical, User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from './RoomStatusBadge'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { Room, RoomStatus } from '@/types/room'

const BORDER_COLOR: Record<RoomStatus, string> = {
  available:   'border-l-emerald-500',
  occupied:    'border-l-blue-500',
  cleaning:    'border-l-amber-500',
  maintenance: 'border-l-red-500',
  blocked:     'border-l-gray-500',
}

const NEXT_STATUSES: Record<RoomStatus, { label: string; value: RoomStatus }[]> = {
  available:   [{ label: 'Mark Occupied', value: 'occupied' }, { label: 'Needs Cleaning', value: 'cleaning' }, { label: 'Maintenance', value: 'maintenance' }],
  occupied:    [{ label: 'Mark Available', value: 'available' }, { label: 'Needs Cleaning', value: 'cleaning' }],
  cleaning:    [{ label: 'Mark Available', value: 'available' }, { label: 'Maintenance', value: 'maintenance' }],
  maintenance: [{ label: 'Mark Available', value: 'available' }, { label: 'Needs Cleaning', value: 'cleaning' }],
  blocked:     [{ label: 'Mark Available', value: 'available' }],
}

interface RoomCardProps {
  room: Room
  canManage: boolean
  onEdit: (room: Room) => void
  onStatusChange: (roomId: string, status: RoomStatus) => void
}

export function RoomCard({ room, canManage, onEdit, onStatusChange }: RoomCardProps) {
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const supabase = createClient()

  const changeStatus = async (newStatus: RoomStatus) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', room.id)

      if (error) throw error
      onStatusChange(room.id, newStatus)
      toast.success('Status updated', { description: `Room ${room.room_number} is now ${newStatus}.` })
    } catch {
      toast.error('Failed to update room status.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      className={cn(
        'relative cursor-pointer border-l-4 transition-shadow hover:shadow-md',
        BORDER_COLOR[room.status],
        loading && 'opacity-60 pointer-events-none'
      )}
      onClick={() => canManage && onEdit(room)}
    >
      <CardHeader className="px-3 pt-3 pb-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-xl font-bold leading-tight">{room.room_number}</span>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger onClick={e => e.stopPropagation()}>
                <button className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(room)}>Edit Room</DropdownMenuItem>
                <DropdownMenuSeparator />
                {NEXT_STATUSES[room.status].map(opt => (
                  <DropdownMenuItem key={opt.value} onClick={() => changeStatus(opt.value)}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <RoomStatusBadge status={room.status} className="mt-1 text-[10px]" />
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <p className="truncate text-xs font-medium text-foreground/80">
          {(room as any).room_type_id?.name ?? 'Unknown type'}
        </p>
        {(room as any).current_guest_name ? (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <User className="h-3 w-3 shrink-0" />
            {(room as any).current_guest_name}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            ₹{(room as any).room_type_id?.base_price?.toLocaleString('en-IN') ?? '—'}/night
          </p>
        )}
      </CardContent>
    </Card>
  )
}
