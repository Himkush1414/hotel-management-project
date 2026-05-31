import { createClient } from '@/lib/supabase/server'
import { RoomGrid } from '@/components/rooms/RoomGrid'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import type { Room, RoomType, RoomStatus } from '@/types/room'

const STATUS_CONFIG: Record
  RoomStatus,
  { label: string; text: string; bg: string }
> = {
  available:   { label: 'Available',   text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  occupied:    { label: 'Occupied',    text: 'text-blue-700 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-950/30'       },
  cleaning:    { label: 'Cleaning',    text: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30'     },
  maintenance: { label: 'Maintenance', text: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30'         },
}

export default async function RoomsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [
    { data: rawRooms },
    { data: roomTypes },
    { data: activeBookings },
  ] = await Promise.all([
    supabase
      .from('rooms')
      .select('*, room_type:room_types(*)')
      .eq('hotel_id', hotelId)
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true }),
    supabase
      .from('room_types')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('name'),
    supabase
      .from('bookings')
      .select('room_id, guests(full_name)')
      .eq('hotel_id', hotelId)
      .eq('status', 'active'),
  ])

  // Build roomId → guestName map
  const guestMap = new Map<string, string>()
  for (const b of activeBookings ?? []) {
    const name = (b.guests as { full_name: string } | null)?.full_name
    if (b.room_id && name) guestMap.set(b.room_id, name)
  }

  const rooms: Room[] = (rawRooms ?? []).map(r => ({
    ...r,
    current_guest_name: guestMap.get(r.id) ?? null,
  })) as Room[]

  const counts = rooms.reduce(
    (acc, r) => {
      const s = r.status as RoomStatus
      acc[s] = (acc[s] ?? 0) + 1
      return acc
    },
    { available: 0, occupied: 0, cleaning: 0, maintenance: 0 } as Record<RoomStatus, number>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Management"
        subtitle={`${rooms.length} rooms across all floors`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(STATUS_CONFIG) as RoomStatus[]).map(status => (
          <Card key={status} className={STATUS_CONFIG[status].bg}>
            <CardContent className="pb-4 pt-5 text-center">
              <p className={`text-3xl font-bold ${STATUS_CONFIG[status].text}`}>
                {counts[status]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {STATUS_CONFIG[status].label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RoomGrid
        initialRooms={rooms}
        roomTypes={(roomTypes ?? []) as RoomType[]}
      />
    </div>
  )
}
