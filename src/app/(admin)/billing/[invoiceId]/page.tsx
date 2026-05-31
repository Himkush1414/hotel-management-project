import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InvoiceCard } from '@/components/billing/InvoiceCard'
import { InvoiceForm } from '@/components/billing/InvoiceForm'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Invoice } from '@/types/billing'

interface Props { params: Promise<{ invoiceId: string }> }

export default async function InvoiceDetailPage({ params }: Props) {
  const { invoiceId } = await params
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [invoiceResult, itemsResult, paymentsResult] = await Promise.all([
    supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings(
          id, check_in, check_out, booking_reference, adults, children, rate_per_night, total_nights,
          guest:guests(full_name, phone, email, address, city, state),
          room:rooms(room_number, floor, room_type:room_types(name, base_price))
        )
      `)
      .eq('id', invoiceId)
      .eq('hotel_id', hotelId)
      .single(),
    supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),
    supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),
  ])

  if (invoiceResult.error || !invoiceResult.data) notFound()

  const invoice = invoiceResult.data as Invoice
  const items = itemsResult.data ?? []
  const payments = paymentsResult.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice ${invoice.invoice_number}`}
        subtitle={`Booking ${(invoice as Invoice & { booking?: { booking_reference: string } }).booking?.booking_reference ?? ''}`}
        backHref="/billing"
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <InvoiceCard invoice={invoice} />
        </div>
        <div className="lg:col-span-2">
          <InvoiceForm invoice={invoice} items={items} payments={payments} />
        </div>
      </div>
    </div>
  )
}
