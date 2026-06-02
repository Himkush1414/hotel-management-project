'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomCard } from './RoomCard'
import { RoomFilters } from './RoomFilters'
import { RoomForm } from './RoomForm'
import { RoomTypeForm } from './RoomTypeForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime'
import { usePermissions } from '@/hooks/usePermissions'
import type { Room, RoomType, RoomStatus } from '@/types/room'

interface Filters {
  status: string
  floor: string
  roomTypeId: string
}

interface RoomGridProps {
  initialRooms: Room[]
  roomTypes: RoomType[]
}

export function RoomGrid({ initialRooms, roomTypes }: RoomGridProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false)
  const [isTypeFormOpen, setIsTypeFormOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({ status: '', floor: '', roomTypeId: '' })

  const permissions = usePermissions()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  useSupabaseRealtime<Room>({
    table: 'rooms',
    filter: `hotel_id=eq.${hotelId}`,
    onUpdate: (updated: Room) => {
      setRooms(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
    },
    onInsert: (inserted: Room) => {
      setRooms(prev => [...prev, inserted])
    },
    onDelete: (deleted: Partial<Room>) => {
      setRooms(prev => prev.filter(r => r.id !== deleted.id))
    },
  })

  const floors = useMemo((): number[] => {
    const s = new Set(rooms.map(r => r.floor ?? 0))
    return Array.from(s).sort((a, b) => a - b)
  }, [rooms])

  const filtered = useMemo(() => rooms.filter(r => {
    if (filters.status && r.status !== filters.status) return false
    if (filters.floor && String(r.floor) !== filters.floor) return false
    if (filters.roomTypeId && r.room_type_id !== filters.roomTypeId) return false
    return true
  }), [rooms, filters])

  const byFloor = useMemo(() => floors.reduce<Record<number, Room[]>>((acc, f) => {
    acc[f ?? 0] = filtered.filter(r => r.floor === f)
    return acc
  }, {}), [filtered, floors])

  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setIsRoomFormOpen(true)
  }

  const handleAddRoom = () => {
    setSelectedRoom(null)
    setIsRoomFormOpen(true)
  }

  const handleStatusChange = (roomId: string, status: RoomStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status } : r))
  }

  const handleSaved = (room: Room) => {
    setRooms(prev => {
      const exists = prev.some(r => r.id === room.id)
      return exists ? prev.map(r => r.id === room.id ? room : r) : [...prev, room]
    })
    setIsRoomFormOpen(false)
    setSelectedRoom(null)
  }

  const visibleFloors = floors.filter(f => (byFloor[f] ?? []).length > 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <RoomFilters
          floors={floors}
          roomTypes={roomTypes}
          filters={filters}
          onChange={setFilters}
        />
        {permissions.can("EDIT_ROOMS") && (
          <div className="ml-auto flex gap-2">
            {permissions.can("TOGGLE_FEATURE_FLAGS") && (
              <Button variant="outline" size="sm" onClick={() => setIsTypeFormOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Room Type
              </Button>
            )}
            <Button size="sm" onClick={handleAddRoom}>
              <Plus className="mr-1 h-4 w-4" />
              Add Room
            </Button>
          </div>
        )}
      </div>

      {visibleFloors.length === 0 ? (
        <EmptyState
          title="No rooms found"
          description={
            Object.values(filters).some(Boolean)
              ? 'Try adjusting your filters.'
              : 'Get started by adding your first room.'
          }
          action={permissions.can("EDIT_ROOMS") ? { label: 'Add Room', onClick: handleAddRoom } : undefined}
        />
      ) : (
        <div className="space-y-8">
          {visibleFloors.map(floor => (
            <div key={floor} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Floor {floor}
                </h3>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">
                  {byFloor[floor]?.length ?? 0} rooms
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {(byFloor[floor] ?? []).map(room => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onEdit={handleEdit}
                    onStatusChange={handleStatusChange}
                    canManage={permissions.can("EDIT_ROOMS")}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomForm
        room={selectedRoom}
        roomTypes={roomTypes}
        open={isRoomFormOpen}
        onClose={() => { setIsRoomFormOpen(false); setSelectedRoom(null) }}
        onSaved={handleSaved}
      />
      <RoomTypeForm open={isTypeFormOpen} onClose={() => setIsTypeFormOpen(false)} />
    </div>
  )
}
