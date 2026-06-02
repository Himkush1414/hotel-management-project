'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Plus, CreditCard, Tag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ExtrasForm } from './ExtrasForm'
import { PaymentForm } from './PaymentForm'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/billing'

const PAYMENT_BADGE: Record<string, string> = {
  paid:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  partial: 'bg-orange-100 text-orange-800 border-orange-200',
}

type InvoiceWithBooking = Invoice & {
  booking?: {
    booking_number: string
    check_in_date: string
    check_out_date: string
    total_nights: number
    room_rate: number
    guest?: { full_name: string; phone: string }
    room?: { room_number: string; room_type_id?: { name: string } }
  }
}

interface InvoiceCardProps {
  invoice: InvoiceWithBooking
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const [isExtrasOpen, setIsExtrasOpen] = useState(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const router = useRouter()

  const b = invoice.booking

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-mono">{invoice.invoice_number}</p>
              <CardTitle className="text-base mt-0.5">Invoice Details</CardTitle>
            </div>
            <Badge variant="outline" className={PAYMENT_BADGE[invoice.payment_status] ?? ''}>
              {invoice.payment_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {b && (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{b.guest?.full_name}</p>
              <p className="text-muted-foreground">{b.guest?.phone}</p>
              <p className="text-muted-foreground">Room {b.room?.room_number} · {b.room?.room_type_id?.name}</p>
              <p className="text-muted-foreground">
                {formatDate(b.check_in_date)} → {formatDate(b.check_out_date)}
              </p>
              <p className="text-muted-foreground">
                {b.total_nights} night{b.total_nights !== 1 ? 's' : ''} @ {formatCurrency(b.room_rate)}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({invoice.tax_amount ?? 12}%)</span>
              <span>{formatCurrency(invoice.tax_amount)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>−{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsExtrasOpen(true)}>
              <Plus className="mr-1 h-3 w-3" />
              Extra
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-3 w-3" />
              Print
            </Button>
            {invoice.payment_status !== 'paid' && (
              <Button size="sm" className="col-span-2" onClick={() => setIsPaymentOpen(true)}>
                <CreditCard className="mr-1 h-3 w-3" />
                Collect Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ExtrasForm
        invoice={invoice}
        open={isExtrasOpen}
        onClose={() => setIsExtrasOpen(false)}
        onSaved={() => { setIsExtrasOpen(false); router.refresh() }}
      />
      <PaymentForm
        invoice={invoice}
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => { setIsPaymentOpen(false); router.refresh() }}
      />
    </>
  )
}
