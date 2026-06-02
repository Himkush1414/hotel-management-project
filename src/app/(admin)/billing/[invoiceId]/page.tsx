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
          id, check_in_date, check_out_date, booking_number, adults, children, room_rate, total_nights,
          guest:guests(full_name, phone, email, address, city, state),
          room:rooms(room_number, floor, room_type_id:room_type_ids(name, base_price))
        )
      `)
      .eq('id', invoiceId)
      .eq('hotel_id', hotelId)
      .single(),
    (supabase as any)
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),
    (supabase as any)
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at'),
  ])

  if (invoiceResult.error || !invoiceResult.data) notFound()

  const invoice = invoiceResult.data as Invoice
  const items = (itemsResult.data ?? []) as any[]
  const payments = (paymentsResult.data ?? []) as any[]

  return (
    <div className="space-y-6">
      <PageHeader
        title={"Invoice "+invoice.invoice_number}
        subtitle={"Booking "+((invoice as any).booking?.booking_number ?? (invoice as any).booking?.booking_reference ?? '')}
       
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <InvoiceCard invoice={invoice as any} />
        </div>
        <div className="lg:col-span-2">
          <InvoiceForm invoice={invoice as any} items={items} payments={payments as any} />
        </div>
      </div>
    </div>
  )
}
