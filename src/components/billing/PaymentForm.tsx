'use client'
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { RazorpayButton } from './RazorpayButton'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Invoice } from '@/types/billing'

type PaymentMode = 'cash' | 'card' | 'razorpay' | 'split' | 'upi' | 'bank_transfer'

interface PaymentFormProps {
  invoice: Invoice
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentForm({ invoice, open, onClose, onSuccess }: PaymentFormProps) {
  const [mode, setMode] = useState<PaymentMode>('cash')
  const [splitCash, setSplitCash] = useState(0)
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()
  const supabase = createClient()

  const outstanding = invoice.total_amount
  const splitOnline = outstanding - splitCash

  const handleCashOrCard = async () => {
    setLoading(true)
    try {
      const { error: insertError } = await supabase.from('payments').insert({
        invoice_id: invoice.id,
        hotel_id: invoice.hotel_id,
        amount: outstanding,
        payment_mode: mode as any,
        payment_date: new Date().toISOString().split('T')[0],
      } as any)
      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ payment_status: 'paid' })
        .eq('id', invoice.id)
      if (updateError) throw updateError

      success('Payment recorded successfully')
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSplitPayment = async (onlineTransactionId: string) => {
    try {
      // Insert cash portion
      const { error: cashError } = await supabase.from('payments').insert({
        invoice_id: invoice.id,
        hotel_id: invoice.hotel_id,
        amount: splitCash,
        payment_mode: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
      } as any)
      if (cashError) throw cashError

      // Insert online portion
      const { error: onlineError } = await supabase.from('payments').insert({
        invoice_id: invoice.id,
        hotel_id: invoice.hotel_id,
        amount: splitOnline,
        payment_mode: 'razorpay',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_id: onlineTransactionId,
      } as any)
      if (onlineError) throw onlineError

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ payment_status: 'paid' })
        .eq('id', invoice.id)
      if (updateError) throw updateError

      success('Split payment recorded successfully')
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Split payment failed'
      error(msg)
    }
  }

  const handleRazorpaySuccess = async (transactionId: string) => {
    try {
      const { error: insertError } = await supabase.from('payments').insert({
        invoice_id: invoice.id,
        hotel_id: invoice.hotel_id,
        amount: outstanding,
        payment_mode: 'razorpay',
        payment_date: new Date().toISOString().split('T')[0],
        transaction_id: transactionId,
      } as any)
      if (insertError) throw insertError

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ payment_status: 'paid' })
        .eq('id', invoice.id)
      if (updateError) throw updateError

      success('Online payment successful')
      onSuccess()
    } catch {
      error('Error saving payment')
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Due */}
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">Amount Due</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(outstanding)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {invoice.invoice_number}
            </p>
          </div>

          {/* Payment Mode */}
          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select value={mode} onValueChange={v => setMode(v as PaymentMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card (POS)</SelectItem>
                <SelectItem value="razorpay">Online (Razorpay)</SelectItem>
                <SelectItem value="split">Split Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Cash or Card */}
          {(mode === 'cash' || mode === 'card') && (
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              {mode === 'cash'
                ? `Collect ₹${outstanding.toLocaleString('en-IN')} in cash from the guest.`
                : `Process ₹${outstanding.toLocaleString('en-IN')} via POS card machine.`}
            </div>
          )}

          {/* Online via Razorpay */}
          {mode === 'razorpay' && (
            <RazorpayButton
              amount={outstanding}
              invoiceId={invoice.id}
              guestName={(invoice as any).guests?.full_name ?? 'Guest'}
              onSuccess={handleRazorpaySuccess}
            />
          )}

          {/* Split Payment */}
          {mode === 'split' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cash: <strong>{formatCurrency(splitCash)}</strong></span>
                  <span>Online: <strong>{formatCurrency(splitOnline)}</strong></span>
                </div>
                <Slider
                  min={0}
                  max={outstanding}
                  step={10}
                  value={[splitCash]}
                  onValueChange={([val]) => setSplitCash(val ?? 0)}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Drag to adjust cash vs online split
                </p>
              </div>
              {splitOnline > 0 && (
                <RazorpayButton
                  amount={splitOnline}
                  invoiceId={invoice.id}
                  guestName={(invoice as any).guests?.full_name ?? 'Guest'}
                  onSuccess={handleSplitPayment}
                  label={`Pay ${formatCurrency(splitOnline)} Online`}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {(mode === 'cash' || mode === 'card') && (
            <Button onClick={handleCashOrCard} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
