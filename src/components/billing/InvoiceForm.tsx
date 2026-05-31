'use client'

import { useRef } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/billing'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  category: string
}

interface Payment {
  id: string
  amount: number
  payment_mode: string
  payment_date: string
}

type InvoiceWithDetails = Invoice & {
  booking?: {
    booking_reference: string
    check_in: string
    check_out: string
    total_nights: number
    rate_per_night: number
    adults: number
    children: number
    guest?: {
      full_name: string
      phone: string
      email?: string | null
      address?: string | null
      city?: string | null
      state?: string | null
    }
    room?: { room_number: string; floor?: number; room_type?: { name: string } }
  }
}

interface InvoiceFormProps {
  invoice: InvoiceWithDetails
  items: InvoiceItem[]
  payments: Payment[]
}

export function InvoiceForm({ invoice, items, payments }: InvoiceFormProps) {
  const b = invoice.booking
  const g = b?.guest
  const r = b?.room

  return (
    <div>
      {/* Print button — hidden on print */}
      <div className="mb-4 flex justify-end print:hidden">
        <Button onClick={() => window.print()} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <div id="printable-invoice" className="rounded-xl border bg-card p-8 space-y-6">
        {/* Hotel Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hotel Invoice</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Tax Invoice / Bill of Supply</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-semibold text-foreground text-base">{invoice.invoice_number}</p>
            <p>Date: {formatDate(invoice.created_at)}</p>
          </div>
        </div>

        <Separator />

        {/* Guest and Room Info */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Bill To</p>
            <p className="font-semibold text-base">{g?.full_name ?? '—'}</p>
            {g?.phone && <p>{g.phone}</p>}
            {g?.email && <p>{g.email}</p>}
            {g?.address && <p className="text-muted-foreground">{g.address}</p>}
            {(g?.city || g?.state) && (
              <p className="text-muted-foreground">
                {[g.city, g.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <div className="space-y-1 text-right">
            <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Stay Details</p>
            <p className="font-semibold">Room {r?.room_number} · {r?.room_type?.name}</p>
            <p>Ref: {b?.booking_reference}</p>
            <p>Check-in: {formatDate(b?.check_in ?? '')}</p>
            <p>Check-out: {formatDate(b?.check_out ?? '')}</p>
            <p>{b?.total_nights ?? 0} night{(b?.total_nights ?? 0) !== 1 ? 's' : ''} · {b?.adults ?? 0} adult{(b?.adults ?? 0) !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4">Description</th>
                <th className="pb-2 pr-4 text-right">Qty</th>
                <th className="pb-2 pr-4 text-right">Rate</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Room charge */}
              <tr>
                <td className="py-2.5 pr-4">
                  Room {r?.room_number} ({r?.room_type?.name}) — Accommodation
                </td>
                <td className="py-2.5 pr-4 text-right">{b?.total_nights ?? 0} nights</td>
                <td className="py-2.5 pr-4 text-right">{formatCurrency(b?.rate_per_night ?? 0)}</td>
                <td className="py-2.5 text-right font-medium">
                  {formatCurrency((b?.total_nights ?? 0) * (b?.rate_per_night ?? 0))}
                </td>
              </tr>
              {/* Extra items */}
              {items.map(item => (
                <tr key={item.id}>
                  <td className="py-2.5 pr-4">
                    {item.description}
                    <span className="ml-2 text-xs text-muted-foreground capitalize">({item.category})</span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">{item.quantity}</td>
                  <td className="py-2.5 pr-4 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator />

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST ({invoice.tax_percentage ?? 12}%)</span>
              <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>−{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payments Received</p>
              <div className="space-y-1 text-sm">
                {payments.map(p => (
                  <div key={p.id} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{p.payment_mode} · {formatDate(p.payment_date)}</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <p className="text-center text-xs text-muted-foreground">
          Thank you for staying with us. We look forward to welcoming you again.
        </p>
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body > *:not(#printable-invoice) { display: none; }
          #printable-invoice { border: none; padding: 0; }
        }
      `}</style>
    </div>
  )
}
