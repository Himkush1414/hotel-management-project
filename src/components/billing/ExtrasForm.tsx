'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { Invoice } from '@/types/billing'

const extrasSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Must be positive'),
  quantity: z.number().int().positive().default(1),
  category: z.enum(['food', 'laundry', 'room_service', 'transport', 'minibar', 'other']),
})

type ExtrasFormData = z.infer<typeof extrasSchema>

const CATEGORIES = [
  { value: 'food',         label: 'Food & Beverages' },
  { value: 'laundry',      label: 'Laundry'          },
  { value: 'room_service', label: 'Room Service'      },
  { value: 'transport',    label: 'Transport'         },
  { value: 'minibar',      label: 'Minibar'           },
  { value: 'other',        label: 'Other'             },
]

interface ExtrasFormProps {
  invoice: Invoice
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ExtrasForm({ invoice, open, onClose, onSaved }: ExtrasFormProps) {
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<ExtrasFormData>({
    resolver: zodResolver(extrasSchema),
    defaultValues: { description: '', amount: 0, quantity: 1, category: 'other' },
  })

  useEffect(() => {
    if (open) form.reset({ description: '', amount: 0, quantity: 1, category: 'other' })
  }, [open, form])

  const onSubmit = async (data: ExtrasFormData) => {
    try {
      const lineAmount = data.amount * data.quantity

      // Add invoice item
      const { error: itemErr } = await supabase.from('invoice_items').insert({
        invoice_id: invoice.id,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.amount,
        amount: lineAmount,
        category: data.category,
      })
      if (itemErr) throw itemErr

      // Update invoice totals
      const newSubtotal   = invoice.subtotal + lineAmount
      const taxAmount     = newSubtotal * ((invoice.tax_percentage ?? 12) / 100)
      const newTotal      = newSubtotal + taxAmount - invoice.discount

      const { error: invErr } = await supabase
        .from('invoices')
        .update({
          subtotal: newSubtotal,
          tax_amount: taxAmount,
          total: newTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoice.id)
      if (invErr) throw invErr

      toast({ title: 'Extra charge added' })
      onSaved()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add charge'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Extra Charge</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input placeholder="Room service — dinner" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Adding…' : 'Add Charge'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
