import { createClient } from '@/lib/supabase/server'
import { InvoiceTable } from '@/components/billing/InvoiceTable'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Invoice } from '@/types/billing'

interface SearchParams {
  status?: string
  from?: string
  to?: string
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status = '', from = '', to = '' } = await searchParams
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  let query = supabase
    .from('invoices')
    .select(`
      *,
      booking:bookings(
        id, check_in_date, check_out_date, booking_number,
        guest:guests(full_name, phone),
        room:rooms(room_number, room_type_id:room_type_ids(name))
      )
    `)
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(200)

  if (status) query = query.eq('payment_status', status as any)
  if (from)   query = query.gte('created_at', from)
  if (to)     query = query.lte('created_at', `${to}T23:59:59`)

  const { data: invoices } = await query

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        subtitle="Invoices, payments and financial records"
      />
      <InvoiceTable
        invoices={(invoices ?? []) as Invoice[]}
        activeStatus={status}
        fromDate={from}
        toDate={to}
      />
    </div>
  )
}
