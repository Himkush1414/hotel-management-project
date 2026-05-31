import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GuestCard } from '@/components/guests/GuestCard'
import { GuestHistory } from '@/components/guests/GuestHistory'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Guest } from '@/types/guest'
import type { Booking } from '@/types/booking'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GuestDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [guestResult, bookingsResult] = await Promise.all([
    supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .eq('hotel_id', hotelId)
      .single(),
    supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(room_number, room_type:room_types(name)),
        invoices(id, invoice_number, total, payment_status)
      `)
      .eq('guest_id', id)
      .eq('hotel_id', hotelId)
      .order('check_in', { ascending: false }),
  ])

  if (guestResult.error || !guestResult.data) notFound()

  const guest = guestResult.data as Guest
  const bookings = (bookingsResult.data ?? []) as Booking[]

  const totalSpent = bookings.reduce<number>((sum, b) => {
    const invoices = (b as Booking & { invoices?: Array<{ total: number }> }).invoices ?? []
    return sum + invoices.reduce((s, inv) => s + (inv.total ?? 0), 0)
  }, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title={guest.full_name}
        subtitle={`Guest profile · ${bookings.length} stays`}
        backHref="/guests"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GuestCard guest={guest} totalStays={bookings.length} totalSpent={totalSpent} />
        </div>
        <div className="lg:col-span-2">
          <GuestHistory bookings={bookings} />
        </div>
      </div>
    </div>
  )
}
