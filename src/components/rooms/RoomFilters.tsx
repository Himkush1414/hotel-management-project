'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { RoomType, RoomStatus } from '@/types/room'

const STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: 'available',   label: 'Available'   },
  { value: 'occupied',    label: 'Occupied'    },
  { value: 'cleaning',    label: 'Cleaning'    },
  { value: 'maintenance', label: 'Maintenance' },
]

interface Filters {
  status: string
  floor: string
  roomTypeId: string
}

interface RoomFiltersProps {
  floors: number[]
  roomTypes: RoomType[]
  filters: Filters
  onChange: (f: Filters) => void
}

export function RoomFilters({ floors, roomTypes, filters, onChange }: RoomFiltersProps) {
  const hasFilters = Boolean(filters.status || filters.floor || filters.roomTypeId)

  const set = (key: keyof Filters, val: string) =>
    onChange({ ...filters, [key]: val })

  const clear = () => onChange({ status: '', floor: '', roomTypeId: '' })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status toggle */}
      <ToggleGroup
        type="single"
        value={filters.status}
        onValueChange={v => set('status', v)}
        className="flex-wrap"
      >
        {STATUS_OPTIONS.map(s => (
          <ToggleGroupItem key={s.value} value={s.value} className="text-xs">
            {s.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {/* Floor filter */}
      <Select value={filters.floor || 'all'} onValueChange={v => set('floor', !v || v === 'all' ? '' : v)}>
        <SelectTrigger className="h-9 w-32 text-xs">
          <SelectValue placeholder="All floors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Floors</SelectItem>
          {floors.map(f => (
            <SelectItem key={String(f)} value={String(f ?? 0)}>Floor {f}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Room type filter */}
      <Select value={filters.roomTypeId || 'all'} onValueChange={v => set('roomTypeId', !v || v === 'all' ? '' : v)}>
        <SelectTrigger className="h-9 w-40 text-xs">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {roomTypes.map(rt => (
            <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="text-xs text-muted-foreground">
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
