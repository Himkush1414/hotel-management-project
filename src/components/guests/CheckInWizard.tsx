'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronRight, User, BedDouble, CalendarCheck, Receipt } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { bookingSchema } from '@/lib/validations/booking'
import { formatCurrency, formatDate, calculateNights, generateInvoiceNumber } from '@/lib/utils'
import type { Guest } from '@/types/guest'
import type { Room } from '@/types/room'

type BookingFormData = z.infer<typeof bookingSchema>

const STEPS = [
  { id: 1, label: 'Guest',      icon: User           },
  { id: 2, label: 'Room',       icon: BedDouble      },
  { id: 3, label: 'Details',    icon: CalendarCheck  },
  { id: 4, label: 'Confirm',    icon: Receipt        },
]

interface CheckInWizardProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CheckInWizard({ open, onClose, onSuccess }: CheckInWizardProps) {
  const [step, setStep] = useState(1)
  const [guestSearch, setGuestSearch] = useState('')
  const [guestResults, setGuestResults] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      check_in: new Date().toISOString().split('T')[0],
      check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      adults: 1, children: 0,
      rate_per_night: 0,
      special_requests: '',
    },
  })

  const searchGuests = useCallback(async (q: string) => {
    if (!q.trim()) { setGuestResults([]); return }
    setIsSearching(true)
    try {
      const { data } = await supabase
        .from('guests')
        .select('*')
        .eq('hotel_id', hotelId)
        .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(8)
      setGuestResults((data ?? []) as Guest[])
    } finally {
      setIsSearching(false)
    }
  }, [supabase, hotelId])

  const loadAvailableRooms = useCallback(async () => {
    setIsLoadingRooms(true)
    try {
      const { data } = await supabase
        .from('rooms')
        .select('*, room_type:room_types(*)')
        .eq('hotel_id', hotelId)
        .eq('status', 'available')
        .order('floor')
        .order('room_number')
      setAvailableRooms((data ?? []) as Room[])
    } finally {
      setIsLoadingRooms(false)
    }
  }, [supabase, hotelId])

  const goToStep2 = () => {
    if (!selectedGuest) { toast({ title: 'Select a guest', variant: 'destructive' }); return }
    setStep(2)
    loadAvailableRooms()
  }

  const goToStep3 = () => {
    if (!selectedRoom) { toast({ title: 'Select a room', variant: 'destructive' }); return }
    form.setValue('rate_per_night', selectedRoom.room_type?.base_price ?? 0)
    setStep(3)
  }

  const goToStep4 = async () => {
    const valid = await form.trigger()
    if (!valid) return
    setStep(4)
  }

  const handleSubmit = async () => {
    if (!selectedGuest || !selectedRoom) return
    const data = form.getValues()
    try {
      const nights = calculateNights(data.check_in, data.check_out)
      const ref = `BK-${Date.now().toString(36).toUpperCase()}`

      // Create booking
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .insert({
          hotel_id: hotelId,
          guest_id: selectedGuest.id,
          room_id: selectedRoom.id,
          booking_reference: ref,
          check_in: data.check_in,
          check_out: data.check_out,
          status: 'active',
          adults: data.adults,
          children: data.children,
          rate_per_night: data.rate_per_night,
          total_nights: nights,
          special_requests: data.special_requests ?? null,
        })
        .select()
        .single()

      if (bookingErr) throw bookingErr

      // Update room status
      await supabase.from('rooms').update({ status: 'occupied' }).eq('id', selectedRoom.id)

      // Create initial invoice
      const subtotal = nights * data.rate_per_night
      const taxAmount = subtotal * 0.12
      const total = subtotal + taxAmount

      await supabase.from('invoices').insert({
        hotel_id: hotelId,
        booking_id: booking.id,
        invoice_number: generateInvoiceNumber(),
        subtotal,
        tax_percentage: 12,
        tax_amount: taxAmount,
        discount: 0,
        total,
        payment_status: 'pending',
      })

      toast({ title: 'Check-in successful!', description: `Booking ${ref} created.` })
      handleClose()
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Check-in failed'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  const handleClose = () => {
    setStep(1)
    setGuestSearch('')
    setGuestResults([])
    setSelectedGuest(null)
    setSelectedRoom(null)
    setAvailableRooms([])
    form.reset()
    onClose()
  }

  const watchedData = form.watch()
  const nights = calculateNights(watchedData.check_in ?? '', watchedData.check_out ?? '')
  const subtotal = (nights > 0 ? nights : 0) * (watchedData.rate_per_night ?? 0)

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Check-In</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold
                ${step > s.id ? 'bg-primary text-primary-foreground' :
                  step === s.id ? 'bg-primary/20 text-primary border border-primary' :
                  'bg-muted text-muted-foreground'}`}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={`ml-1 text-xs hidden sm:block ${step === s.id ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        <Separator />

        <div className="min-h-[280px]">
          {/* Step 1: Select Guest */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Search existing guest or add new</p>
              <Input
                placeholder="Search by name or phone…"
                value={guestSearch}
                onChange={e => {
                  setGuestSearch(e.target.value)
                  searchGuests(e.target.value)
                }}
              />
              {isSearching && <p className="text-xs text-muted-foreground">Searching…</p>}
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {guestResults.map(g => (
                  <div
                    key={g.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors
                      ${selectedGuest?.id === g.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedGuest(g)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                      {g.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{g.full_name}</p>
                      <p className="text-xs text-muted-foreground">{g.phone}</p>
                    </div>
                    {selectedGuest?.id === g.id && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
              {selectedGuest && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{selectedGuest.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedGuest.phone}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedGuest(null)}>Change</Button>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={goToStep2} disabled={!selectedGuest}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Room */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Select an available room</p>
              {isLoadingRooms ? (
                <p className="text-sm text-muted-foreground">Loading rooms…</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {availableRooms.map(r => (
                    <div
                      key={r.id}
                      className={`rounded-lg border p-2 cursor-pointer text-center transition-colors
                        ${selectedRoom?.id === r.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedRoom(r)}
                    >
                      <p className="font-bold text-lg">{r.room_number}</p>
                      <p className="text-xs text-muted-foreground">{r.room_type?.name}</p>
                      <p className="text-xs font-medium mt-0.5">₹{(r.room_type?.base_price ?? 0).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  {availableRooms.length === 0 && (
                    <p className="col-span-3 py-8 text-center text-sm text-muted-foreground">No available rooms.</p>
                  )}
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={goToStep3} disabled={!selectedRoom}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Booking Details */}
          {step === 3 && (
            <Form {...form}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="check_in" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="check_out" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="adults" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adults</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="children" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Children</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rate_per_night" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Rate per Night (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="special_requests" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl><Textarea placeholder="Any special requests?" rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={goToStep4}>
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Form>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guest</span>
                  <span className="font-medium">{selectedGuest?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium">{selectedRoom?.room_number} · {selectedRoom?.room_type?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span>{formatDate(watchedData.check_in ?? '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span>{formatDate(watchedData.check_out ?? '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nights</span>
                  <span>{nights > 0 ? nights : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate/night</span>
                  <span>{formatCurrency(watchedData.rate_per_night ?? 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Subtotal (excl. tax)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (12%)</span>
                  <span>{formatCurrency(subtotal * 0.12)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal * 1.12)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={handleSubmit} disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Processing…' : 'Confirm Check-In'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
