'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { roomTypeSchema } from '@/lib/validations/room'
import type { RoomTypeFormData as _RoomTypeFormData } from '@/lib/validations/room'
import type { RoomType } from '@/types/room'

type RoomTypeFormData = z.infer<typeof roomTypeSchema>

interface RoomTypeFormProps {
  roomType?: RoomType | null
  open: boolean
  onClose: () => void
  onSaved?: (rt: RoomType) => void
}

export function RoomTypeForm({ roomType, open, onClose, onSaved }: RoomTypeFormProps) {
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState('')
  const toast = useToast()
  const supabase = createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!

  const form = useForm<RoomTypeFormData>({
    resolver: zodResolver(roomTypeSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      base_price: 0,
      max_occupancy: 2,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        roomType
          ? {
              name: roomType.name,
              description: roomType.description ?? '',
              base_price: roomType.base_price,
              max_occupancy: roomType.max_occupancy,
            }
          : { name: '', description: '', base_price: 0, max_occupancy: 2 }
      )
      setAmenities(roomType?.amenities ?? [])
      setAmenityInput('')
    }
  }, [open, roomType, form])

  const addAmenity = () => {
    const val = amenityInput.trim()
    if (val && !amenities.includes(val)) {
      setAmenities(prev => [...prev, val])
    }
    setAmenityInput('')
  }

  const handleAmenityKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addAmenity() }
  }

  const removeAmenity = (a: string) => setAmenities(prev => prev.filter(x => x !== a))

  const onSubmit = async (data: RoomTypeFormData) => {
    try {
      const payload = { ...data, amenities, hotel_id: hotelId }

      if (roomType) {
        const { data: updated, error } = await supabase
          .from('room_type_ids')
          .update({ ...payload, updated_at: new Date().toISOString() } as any)
          .eq('id', roomType.id)
          .select()
          .single()
        if (error) throw error
        onSaved?.(updated as RoomType)
        toast.success('Room type updated')
      } else {
        const { data: created, error } = await supabase
          .from('room_type_ids')
          .insert(payload as any)
          .select()
          .single()
        if (error) throw error
        onSaved?.(created as RoomType)
        toast.success('Room type created')
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{roomType ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="e.g. Deluxe Suite" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="base_price" render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Base Price (₹/night)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="2500"
                      {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="max_occupancy" render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Max Occupancy</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="2"
                      {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe this room type…" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Amenities tag input */}
            <div className="space-y-2">
              <FormLabel>Amenities</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. AC, WiFi — press Enter"
                  value={amenityInput}
                  onChange={e => setAmenityInput(e.target.value)}
                  onKeyDown={handleAmenityKey}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addAmenity}>
                  Add
                </Button>
              </div>
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {amenities.map(a => (
                    <Badge key={a} variant="secondary" className="flex items-center gap-1">
                      {a}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeAmenity(a)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving…' : roomType ? 'Save Changes' : 'Create Type'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
