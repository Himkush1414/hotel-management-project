'use client'

import { useState, useEffect } from 'react'
import { Printer } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, calculateNights } from '@/lib/utils'
import type { Booking } from '@/types/booking'

type PaymentMode = 'cash' | 'card' | 'online' | 'split'

interface Invoice {
  id: string
  invoice_number: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_status: string
}

type BookingWithExtras = Booking & {
  guest?: { full_name: string; phone: string }
  room?: { room_number: string; room_type_id?: { name: string } }
}

interface CheckOutFormProps {
  booking: BookingWithExtras
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CheckOutForm({ booking, open, onClose, onSuccess }: CheckOutFormProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const toast = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    const fetchInvoice = async () => {
      setFetching(true)
      try {
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .eq('booking_id', booking.id)
          .single()
        setInvoice(data as Invoice | null)
      } finally {
        setFetching(false)
      }
    }
    fetchInvoice()
  }, [open, booking.id, supabase])

  const handleCheckOut = async () => {
    if (!invoice) return
    setLoading(true)
    try {
      // Mark invoice as paid
      await supabase
        .from('invoices')
        .update({ payment_status: 'paid', payment_mode: paymentMode } as any)
        .eq('id', invoice.id)

      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'checked_out', updated_at: new Date().toISOString() })
        .eq('id', booking.id)

      // Update room to cleaning
      await supabase
        .from('rooms')
        .update({ status: 'cleaning', updated_at: new Date().toISOString() })
        .eq('id', booking.room_id)

      toast.success('Check-out complete', { description: `Room ${booking.room?.room_number} is now set to cleaning.` })
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Check-out failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const nights = calculateNights(booking.check_in_date, booking.check_out_date)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check Out — Room {booking.room?.room_number}</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading invoice…</div>
        ) : (
          <div className="space-y-4">
            {/* Guest + Booking Info */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
              <p className="font-semibold">{booking.guest?.full_name}</p>
              <p className="text-muted-foreground">{booking.guest?.phone}</p>
              <p className="text-muted-foreground">
                {formatDate(booking.check_in_date)} → {formatDate(booking.check_out_date)} · {nights} night{nights !== 1 ? 's' : ''}
              </p>
              <p className="text-muted-foreground">{booking.room?.room_type_id?.name}</p>
            </div>

            {/* Invoice Summary */}
            {invoice && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(invoice.discount_amount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Due</span>
                  <span>{formatCurrency(invoice.total_amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    invoice.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                  }>
                    {invoice.payment_status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{invoice.invoice_number}</span>
                </div>
              </div>
            )}

            {/* Payment Mode */}
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={paymentMode} onValueChange={v => setPaymentMode(v as PaymentMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="online">Online / UPI</SelectItem>
                  <SelectItem value="split">Split Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCheckOut} disabled={loading || fetching || !invoice}>
            {loading ? 'Processing…' : 'Complete Check-Out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
