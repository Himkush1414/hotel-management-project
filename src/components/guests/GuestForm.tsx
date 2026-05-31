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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { guestSchema } from '@/lib/validations/guest'
import type { Guest } from '@/types/guest'

type GuestFormData = z.infer<typeof guestSchema>

const ID_PROOF_TYPES = [
  { value: 'aadhar',          label: 'Aadhaar Card'     },
  { value: 'passport',        label: 'Passport'         },
  { value: 'driving_license', label: 'Driving License'  },
  { value: 'voter_id',        label: 'Voter ID'         },
  { value: 'pan_card',        label: 'PAN Card'         },
]

interface GuestFormProps {
  guest: Guest | null
  open: boolean
  onClose: () => void
  onSaved: (guest: Guest) => void
}

export function GuestForm({ guest, open, onClose, onSaved }: GuestFormProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      full_name: '', phone: '', email: '',
      id_proof_type: 'aadhar', id_proof_number: '',
      address: '', city: '', state: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        guest
          ? {
              full_name: guest.full_name, phone: guest.phone, email: guest.email ?? '',
              id_proof_type: guest.id_proof_type, id_proof_number: guest.id_proof_number,
              address: guest.address ?? '', city: guest.city ?? '', state: guest.state ?? '',
            }
          : {
              full_name: '', phone: '', email: '',
              id_proof_type: 'aadhar', id_proof_number: '',
              address: '', city: '', state: '',
            }
      )
    }
  }, [open, guest, form])

  const onSubmit = async (data: GuestFormData) => {
    try {
      if (guest) {
        const { data: updated, error } = await supabase
          .from('guests')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', guest.id)
          .select()
          .single()
        if (error) throw error
        onSaved(updated as Guest)
        toast({ title: 'Guest updated' })
      } else {
        const { data: created, error } = await supabase
          .from('guests')
          .insert({ ...data, hotel_id: hotelId })
          .select()
          .single()
        if (error) throw error
        onSaved(created as Guest)
        toast({ title: 'Guest added' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{guest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="Ravi Kumar" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="ravi@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="id_proof_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Proof Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ID_PROOF_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="id_proof_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl><Input placeholder="XXXX-XXXX-XXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Textarea placeholder="Street address" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : guest ? 'Save Changes' : 'Add Guest'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
