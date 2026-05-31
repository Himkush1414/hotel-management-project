import { createClient } from '@/lib/supabase/server'
import { BookingsClient } from '@/components/bookings/BookingsClient'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Booking } from '@/types/booking'

interface SearchParams { status?: string; q?: string }

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status = '', q = '' } = await searchParams
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('bookings')
    .select(`
      *,
      guest:guests(id, full_name, phone),
      room:rooms(id, room_number, floor, room_type:room_types(name))
    `)
    .eq('hotel_id', hotelId)
    .order('check_in', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status)
  if (q.trim()) {
    query = query.or(
      `guests.full_name.ilike.%${q}%,rooms.room_number.ilike.%${q}%`
    )
  }

  const { data: bookings } = await query

  // Today's arrivals and departures
  const { data: todayArrivals }    = await supabase.from('bookings').select('id').eq('hotel_id', hotelId).eq('check_in', today).eq('status', 'reserved')
  const { data: todayDepartures }  = await supabase.from('bookings').select('id').eq('hotel_id', hotelId).eq('check_out', today).eq('status', 'active')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle={`${todayArrivals?.length ?? 0} arrivals · ${todayDepartures?.length ?? 0} departures today`}
      />
      <BookingsClient
        bookings={(bookings ?? []) as Booking[]}
        todayArrivals={(todayArrivals ?? []).map(b => b.id)}
        todayDepartures={(todayDepartures ?? []).map(b => b.id)}
        activeStatus={status}
        searchQuery={q}
      />
    </div>
  )
}
