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
import { roomSchema } from '@/lib/validations/room'
import type { Room, RoomType, RoomStatus } from '@/types/room'

type RoomFormData = z.infer<typeof roomSchema>

const STATUSES: { value: RoomStatus; label: string }[] = [
  { value: 'available',   label: 'Available'   },
  { value: 'occupied',    label: 'Occupied'    },
  { value: 'cleaning',    label: 'Cleaning'    },
  { value: 'maintenance', label: 'Maintenance' },
]

interface RoomFormProps {
  room: Room | null
  roomTypes: RoomType[]
  open: boolean
  onClose: () => void
  onSaved: (room: Room) => void
}

export function RoomForm({ room, roomTypes, open, onClose, onSaved }: RoomFormProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      room_number: '',
      floor: 1,
      room_type_id: '',
      status: 'available',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        room
          ? {
              room_number: room.room_number,
              floor: room.floor,
              room_type_id: room.room_type_id,
              status: room.status,
              notes: room.notes ?? '',
            }
          : { room_number: '', floor: 1, room_type_id: '', status: 'available', notes: '' }
      )
    }
  }, [open, room, form])

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (room) {
        const { data: updated, error } = await supabase
          .from('rooms')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', room.id)
          .select('*, room_type:room_types(*)')
          .single()
        if (error) throw error
        const roomType = roomTypes.find(rt => rt.id === data.room_type_id)
        onSaved({ ...updated, room_type: roomType ?? updated.room_type } as Room)
        toast({ title: 'Room updated', description: `Room ${data.room_number} has been updated.` })
      } else {
        const { data: created, error } = await supabase
          .from('rooms')
          .insert({ ...data, hotel_id: hotelId })
          .select('*, room_type:room_types(*)')
          .single()
        if (error) throw error
        onSaved(created as Room)
        toast({ title: 'Room created', description: `Room ${data.room_number} has been added.` })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast({ title: 'Error', description: msg, variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="room_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl><Input placeholder="101" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="floor" render={({ field }) => (
                <FormItem>
                  <FormLabel>Floor</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="1"
                      {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="room_type_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Room Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {roomTypes.map(rt => (
                      <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Optional notes about this room..." rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : room ? 'Save Changes' : 'Add Room'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
