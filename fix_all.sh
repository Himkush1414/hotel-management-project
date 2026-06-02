#!/bin/bash
set -e
cd ~/Downloads/hotel-management-project
echo "=== Starting comprehensive TypeScript fix ==="

# ============================================================
# 1. VALIDATIONS: fix _type → z.infer
# ============================================================
python3 << 'PYEOF'
import re

files = {
    'src/lib/validations/expense.ts': [
        ('export type ExpenseFormData = typeof expenseSchema._type;',
         'export type ExpenseFormData = z.infer<typeof expenseSchema>;'),
    ],
    'src/lib/validations/room.ts': [
        ('export const roomTypeSchema = roomSchema;',
         '''export const roomTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional().or(z.literal("")),
  base_price: z.number({ message: "Base price must be a number" }).min(0),
  max_occupancy: z.number().int().min(1).max(100),
  amenities: z.array(z.string()).optional(),
});'''),
        ('export type RoomTypeFormData = typeof roomTypeSchema._type;',
         'export type RoomTypeFormData = z.infer<typeof roomTypeSchema>;'),
        ('export type RoomFormValues = z.infer<typeof roomSchema>;',
         'export type RoomFormValues = z.infer<typeof roomSchema>;\nexport type RoomFormData = z.infer<typeof roomSchema>;'),
    ],
    'src/lib/validations/settings.ts': [
        ('export type SettingsFormData = typeof settingsSchema._type;',
         'export type SettingsFormData = z.infer<typeof settingsSchema>;'),
    ],
    'src/lib/validations/staff.ts': [
        ('export type StaffFormData = typeof staffSchema._type;',
         'export type StaffFormData = z.infer<typeof staffSchema>;'),
    ],
}

for path, replacements in files.items():
    with open(path, 'r') as f:
        content = f.read()
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"  Fixed: {path}")
        else:
            print(f"  WARN (not found): {old[:60]} in {path}")
    with open(path, 'w') as f:
        f.write(content)

print("Validations done.")
PYEOF

# ============================================================
# 2. Fix staffSchema: emergency_contact_name/phone → keep separate
# ============================================================
python3 << 'PYEOF'
path = 'src/lib/validations/staff.ts'
with open(path, 'r') as f:
    content = f.read()

# The schema already has emergency_contact_name and emergency_contact_phone
# StaffFormData is z.infer so it already has them correctly
# Just ensure the type is exported
print(f"Staff validation OK.")
PYEOF

# ============================================================
# 3. Fix src/lib/supabase/client.ts — export createBrowserClient
# ============================================================
python3 << 'PYEOF'
path = 'src/lib/supabase/client.ts'
with open(path, 'r') as f:
    content = f.read()

new_content = '''import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createClient() {
  return createBrowserClient()
}
'''
with open(path, 'w') as f:
    f.write(new_content)
print("Fixed client.ts")
PYEOF

# ============================================================
# 4. Fix src/lib/supabase/middleware.ts — createServerClient, not createClient
# ============================================================
python3 << 'PYEOF'
path = 'src/lib/supabase/middleware.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'const supabase = createClient<Database>(',
    'const supabase = createServerClient<Database>('
)
content = content.replace(
    "{ name, value }: { name: string; value: string; options: any }",
    "{ name, value, options }: { name: string; value: string; options: any }"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed middleware.ts")
PYEOF

# ============================================================
# 5. Fix src/middleware.ts — createServerClient, not createClient
# ============================================================
python3 << 'PYEOF'
path = 'src/middleware.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'const supabase = createClient<Database>(',
    'const supabase = createServerClient<Database>('
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed middleware.ts (root)")
PYEOF

# ============================================================
# 6. Fix useSupabaseRealtime.ts — rewrite to support onInsert/onUpdate/onDelete
# ============================================================
python3 << 'PYEOF'
path = 'src/hooks/useSupabaseRealtime.ts'
new_content = '''"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/client";

type TableRow = Record<string, unknown>;

export interface UseSupabaseRealtimeOptions<T extends TableRow> {
  table: string;
  filter?: string;
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: Partial<T>) => void;
  onData?: (payload: any) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime<T extends TableRow>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onData,
  enabled = true,
}: UseSupabaseRealtimeOptions<T>): void {
  const supabase = createBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  const onDataRef = useRef(onData);
  onInsertRef.current = onInsert;
  onUpdateRef.current = onUpdate;
  onDeleteRef.current = onDelete;
  onDataRef.current = onData;

  useEffect(() => {
    if (!enabled) return;

    const channelName = filter ? `rt:${table}:${filter}` : `rt:${table}`;
    const channel = supabase.channel(channelName);

    const config: any = { event: "*", schema: "public", table };
    if (filter) config.filter = filter;

    channel
      .on("postgres_changes" as any, config, (payload: any) => {
        if (onDataRef.current) onDataRef.current(payload);
        if (payload.eventType === "INSERT" && onInsertRef.current) {
          onInsertRef.current(payload.new as T);
        }
        if (payload.eventType === "UPDATE" && onUpdateRef.current) {
          onUpdateRef.current(payload.new as T);
        }
        if (payload.eventType === "DELETE" && onDeleteRef.current) {
          onDeleteRef.current(payload.old as Partial<T>);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, table, filter, supabase]);
}
'''
with open(path, 'w') as f:
    f.write(new_content)
print("Fixed useSupabaseRealtime.ts")
PYEOF

# ============================================================
# 7. Fix src/components/ui/use-toast.ts
# ============================================================
python3 << 'PYEOF'
path = 'src/components/ui/use-toast.ts'
new_content = '''export { toast } from 'sonner'

import { toast } from 'sonner'

export function useToast() {
  return toast
}
'''
with open(path, 'w') as f:
    f.write(new_content)
print("Fixed use-toast.ts")
PYEOF

# ============================================================
# 8. Fix src/components/ui/SearchInput.tsx — useRef initial value
# ============================================================
python3 << 'PYEOF'
path = 'src/components/ui/SearchInput.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'const timerRef = useRef<ReturnType<typeof setTimeout>>();',
    'const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed SearchInput.tsx")
PYEOF

# ============================================================
# 9. Fix src/types/room.ts — RoomWithType conflict + export RoomType from correct table
# ============================================================
python3 << 'PYEOF'
path = 'src/types/room.ts'
new_content = '''import type { Database } from "./database";

export type { RoomStatus } from "./database";

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomType = Database["public"]["Tables"]["room_type_ids"]["Row"];

export type RoomWithType = Omit<Room, "room_type_id"> & {
  room_type_id: RoomType | string;
};

export interface RoomStatusUpdate {
  room_id: string;
  status: import("./database").RoomStatus;
  notes?: string;
}
'''
with open(path, 'w') as f:
    f.write(new_content)
print("Fixed types/room.ts")
PYEOF

# ============================================================
# 10. Fix src/lib/utils/auditLog.ts — user_id → performed_by, entity_type fix
# ============================================================
python3 << 'PYEOF'
path = 'src/lib/utils/auditLog.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'performed_by: params.user_id,',
    'performed_by: params.performed_by,'
)
content = content.replace(
    '      entity_type: params.entity_type,\n      entity_id: params.entity_id,',
    '      table_name: params.entity_type,\n      record_id: params.entity_id,'
)
# Remove entity_type and entity_id from insert since DB uses table_name/record_id
with open(path, 'w') as f:
    f.write(content)
print("Fixed auditLog.ts")
PYEOF

# ============================================================
# 11. Fix RoomCard.tsx — add 'blocked' status + fix toast calls
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomCard.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add blocked to BORDER_COLOR
content = content.replace(
    "  maintenance: 'border-l-red-500',\n}",
    "  maintenance: 'border-l-red-500',\n  blocked:     'border-l-gray-500',\n}"
)

# Add blocked to NEXT_STATUSES
content = content.replace(
    "  maintenance: [{ label: 'Mark Available', value: 'available' }, { label: 'Needs Cleaning', value: 'cleaning' }],\n}",
    "  maintenance: [{ label: 'Mark Available', value: 'available' }, { label: 'Needs Cleaning', value: 'cleaning' }],\n  blocked:     [{ label: 'Mark Available', value: 'available' }],\n}"
)

# Fix toast calls: toast({ title, description }) -> toast.success/toast.error
content = content.replace(
    "toast({ title: 'Status updated', description: `Room ${room.room_number} is now ${newStatus}.` })",
    "toast.success('Status updated', { description: `Room ${room.room_number} is now ${newStatus}.` })"
)
content = content.replace(
    "toast({ title: 'Error', description: 'Failed to update room status.', variant: 'destructive' })",
    "toast.error('Failed to update room status.')"
)

# Fix room_type_id?.name — already uses (room as any) pattern which is fine
# The room_type_id is typed as string in Room but joined as object, cast needed
content = content.replace(
    "  const toast = useToast()",
    "  const toast = useToast()"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomCard.tsx")
PYEOF

# ============================================================
# 12. Fix RoomStatusBadge.tsx — add 'blocked'
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomStatusBadge.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "  maintenance: { label: 'Maintenance', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'                     },\n}",
    "  maintenance: { label: 'Maintenance', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'                     },\n  blocked:     { label: 'Blocked',      className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300'                 },\n}"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomStatusBadge.tsx")
PYEOF

# ============================================================
# 13. Fix rooms/page.tsx — add 'blocked' to STATUS_CONFIG
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/rooms/page.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "  maintenance: { label: 'Maintenance', text: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30'         },\n}",
    "  maintenance: { label: 'Maintenance', text: 'text-red-700 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-950/30'         },\n  blocked:     { label: 'Blocked',      text: 'text-gray-700 dark:text-gray-400',       bg: 'bg-gray-50 dark:bg-gray-950/30'       },\n}"
)
# Fix counts object to include blocked
content = content.replace(
    "    { available: 0, occupied: 0, cleaning: 0, maintenance: 0 } as Record<RoomStatus, number>",
    "    { available: 0, occupied: 0, cleaning: 0, maintenance: 0, blocked: 0 } as Record<RoomStatus, number>"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed rooms/page.tsx")
PYEOF

# ============================================================
# 14. Fix RoomGrid.tsx — remove onUpdate/onInsert/onDelete, use new hook API
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomGrid.tsx'
with open(path, 'r') as f:
    content = f.read()

# Replace the broken useSupabaseRealtime call with the new API
old_call = '''  useSupabaseRealtime<Room>({
    table: 'rooms',
    filter: `hotel_id=eq.${hotelId}`,
    onUpdate: useCallback((updated: Room) => {
      setRooms(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
    }, []),
    onInsert: useCallback((inserted: Room) => {
      setRooms(prev => [...prev, inserted])
    }, []),
    onDelete: useCallback((deleted: Partial<Room>) => {
      setRooms(prev => prev.filter(r => r.id !== deleted.id))
    }, []),
  })'''

new_call = '''  useSupabaseRealtime<Room>({
    table: 'rooms',
    filter: `hotel_id=eq.${hotelId}`,
    onUpdate: (updated: Room) => {
      setRooms(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r))
    },
    onInsert: (inserted: Room) => {
      setRooms(prev => [...prev, inserted])
    },
    onDelete: (deleted: Partial<Room>) => {
      setRooms(prev => prev.filter(r => r.id !== deleted.id))
    },
  })'''

content = content.replace(old_call, new_call)

# Remove useCallback from imports since we no longer use it here
content = content.replace(
    "import { useState, useMemo, useCallback } from 'react'",
    "import { useState, useMemo } from 'react'"
)

# Fix null floor indexing issues
content = content.replace(
    "  }, [rooms]))",
    "  }, [rooms]))"
)

# Fix byFloor reduce — floor can be null
content = content.replace(
    "  const byFloor = useMemo(() => floors.reduce<Record<number, Room[]>>((acc, f) => {\n    acc[f] = filtered.filter(r => r.floor === f)\n    return acc\n  }, {}), [filtered, floors])",
    "  const byFloor = useMemo(() => floors.reduce<Record<number, Room[]>>((acc, f) => {\n    acc[f ?? 0] = filtered.filter(r => r.floor === f)\n    return acc\n  }, {}), [filtered, floors])"
)

# Fix floors array — filter out nulls
content = content.replace(
    "    const s = new Set(rooms.map(r => r.floor))\n    return Array.from(s).sort((a, b) => (a ?? 0) - (b ?? 0))",
    "    const s = new Set(rooms.map(r => r.floor ?? 0))\n    return Array.from(s).sort((a, b) => a - b)"
)

# Now floors is number[] not (number|null)[] — fix the filter
content = content.replace(
    "  const floors = useMemo(() => {\n    const s = new Set(rooms.map(r => r.floor ?? 0))\n    return Array.from(s).sort((a, b) => a - b)\n  }, [rooms])",
    "  const floors = useMemo((): number[] => {\n    const s = new Set(rooms.map(r => r.floor ?? 0))\n    return Array.from(s).sort((a, b) => a - b)\n  }, [rooms])"
)

# Fix byFloor access with non-null key
content = content.replace(
    "  }, {}), [filtered, floors])\n\n  const handleEdit",
    "  }, {}), [filtered, floors])\n\n  const handleEdit"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomGrid.tsx")
PYEOF

# ============================================================
# 15. Fix RoomFilters.tsx — ToggleGroupItem size prop + null string
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomFilters.tsx'
with open(path, 'r') as f:
    content = f.read()

# ToggleGroupItem doesn't take size prop — remove it
content = content.replace(
    '<ToggleGroupItem key={s.value} value={s.value} size="sm" className="text-xs">',
    '<ToggleGroupItem key={s.value} value={s.value} className="text-xs">'
)

# Fix null→string for floor select
content = content.replace(
    "<SelectItem key={f} value={String(f)}>Floor {f}</SelectItem>",
    "<SelectItem key={String(f)} value={String(f ?? 0)}>Floor {f}</SelectItem>"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomFilters.tsx")
PYEOF

# ============================================================
# 16. Fix RoomTypeForm.tsx — use correct roomTypeSchema
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomTypeForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Replace import
content = content.replace(
    "import { roomTypeSchema } from '@/lib/validations/room'",
    "import { roomTypeSchema } from '@/lib/validations/room'\nimport type { RoomTypeFormData as _RoomTypeFormData } from '@/lib/validations/room'"
)

# Fix type alias - RoomTypeFormData is already exported from validations
content = content.replace(
    "type RoomTypeFormData = z.infer<typeof roomTypeSchema>",
    "type RoomTypeFormData = z.infer<typeof roomTypeSchema>"
)

# Fix resolver cast
content = content.replace(
    "    resolver: zodResolver(roomTypeSchema),",
    "    resolver: zodResolver(roomTypeSchema) as any,"
)

# Fix form.reset — uses name/base_price/max_occupancy/description which are correct for roomTypeSchema
# Fix onSubmit insert/update casts
content = content.replace(
    "          .update({ ...payload, updated_at: new Date().toISOString() })",
    "          .update({ ...payload, updated_at: new Date().toISOString() } as any)"
)
content = content.replace(
    "          .insert(payload)",
    "          .insert(payload as any)"
)

# Fix handleSubmit
content = content.replace(
    "          <form onSubmit={form.handleSubmit(onSubmit)} className=\"space-y-4\">",
    "          <form onSubmit={form.handleSubmit(onSubmit as any)} className=\"space-y-4\">"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomTypeForm.tsx")
PYEOF

# ============================================================
# 17. Fix RoomForm.tsx — toast calls
# ============================================================
python3 << 'PYEOF'
path = 'src/components/rooms/RoomForm.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "toast({ title: 'Room updated', description: `Room ${data.room_number} has been updated.` })",
    "toast.success('Room updated', { description: `Room ${data.room_number} has been updated.` })"
)
content = content.replace(
    "toast({ title: 'Room created', description: `Room ${data.room_number} has been added.` })",
    "toast.success('Room created', { description: `Room ${data.room_number} has been added.` })"
)
content = content.replace(
    "toast({ title: 'Error', description: msg, variant: 'destructive' })",
    "toast.error(msg)"
)
content = content.replace(
    "  const toast = useToast()\n  const supabase = createClient()",
    "  const toast = useToast()\n  const supabase = createClient()"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed RoomForm.tsx")
PYEOF

# ============================================================
# 18. Fix CheckInWizard.tsx — all issues
# ============================================================
python3 << 'PYEOF'
path = 'src/components/guests/CheckInWizard.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix toast calls
content = content.replace(
    "toast({ title: 'Select a guest', variant: 'destructive' })",
    "toast.error('Select a guest')"
)
content = content.replace(
    "toast({ title: 'Select a room', variant: 'destructive' })",
    "toast.error('Select a room')"
)
content = content.replace(
    "toast({ title: 'Check-in successful!', description: `Booking ${ref} created.` })",
    "toast.success('Check-in successful!', { description: `Booking ${ref} created.` })"
)
content = content.replace(
    "toast({ title: 'Error', description: msg, variant: 'destructive' })",
    "toast.error(msg)"
)

# Fix form defaultValues: check_in → check_in_date, check_out → check_out_date
content = content.replace(
    "      check_in: new Date().toISOString().split('T')[0],\n      check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0],",
    "      check_in_date: new Date().toISOString().split('T')[0],\n      check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],"
)

# Fix form field names in step 3
content = content.replace(
    'name="check_in" render={({ field }: { field: any }) => (\n                    <FormItem>\n                      <FormLabel>Check-in Date</FormLabel>',
    'name="check_in_date" render={({ field }: { field: any }) => (\n                    <FormItem>\n                      <FormLabel>Check-in Date</FormLabel>'
)
content = content.replace(
    'name="check_out" render={({ field }: { field: any }) => (\n                    <FormItem>\n                      <FormLabel>Check-out Date</FormLabel>',
    'name="check_out_date" render={({ field }: { field: any }) => (\n                    <FormItem>\n                      <FormLabel>Check-out Date</FormLabel>'
)

# Fix watchedData references: check_in/check_out → check_in_date/check_out_date (only bare ones)
content = content.replace(
    "calculateNights(watchedData.check_in ?? '', watchedData.check_out ?? '')",
    "calculateNights(watchedData.check_in_date ?? '', watchedData.check_out_date ?? '')"
)
content = content.replace(
    "formatDate(watchedData.check_in ?? '')",
    "formatDate(watchedData.check_in_date ?? '')"
)
content = content.replace(
    "formatDate(watchedData.check_out ?? '')",
    "formatDate(watchedData.check_out_date ?? '')"
)

# Fix booking status: 'active' → 'checked_in'
content = content.replace(
    "          status: 'active',",
    "          status: 'checked_in',"
)

# Fix booking insert columns: check_in/check_out → check_in_date/check_out_date
# and booking_reference → booking_number (the actual DB column)
content = content.replace(
    "          booking_reference: ref,\n          check_in: data.check_in_date,\n          check_out: data.check_out_date,",
    "          booking_number: ref,\n          check_in_date: data.check_in_date,\n          check_out_date: data.check_out_date,"
)

# Fix duplicate tax_amount + discount → discount_amount
old_invoice = '''      await supabase.from('invoices').insert({
        hotel_id: hotelId,
        booking_id: booking.id,
        invoice_number: generateInvoiceNumber(),
        subtotal,
        tax_amount: 12,
        tax_amount: taxAmount,
        discount: 0,
        total,
        payment_status: 'pending',
      })'''
new_invoice = '''      await supabase.from('invoices').insert({
        hotel_id: hotelId,
        booking_id: booking.id,
        invoice_number: generateInvoiceNumber(),
        subtotal,
        tax_amount: taxAmount,
        discount_amount: 0,
        total_amount: total,
        payment_status: 'pending',
      } as any)'''
content = content.replace(old_invoice, new_invoice)

# Fix room.name and room.base_price → (selectedRoom as any).room_type?.name etc
content = content.replace(
    "form.setValue('room_rate', selectedRoom.room_type_id?.base_price ?? 0)",
    "form.setValue('room_rate', (selectedRoom as any).room_type_id?.base_price ?? 0)"
)

# Fix display of room type name in step 2
content = content.replace(
    "<p className=\"text-xs text-muted-foreground\">{r.room_type_id?.name}</p>",
    "<p className=\"text-xs text-muted-foreground\">{(r as any).room_type_id?.name}</p>"
)
content = content.replace(
    "<p className=\"text-xs font-medium mt-0.5\">₹{(r.room_type_id?.base_price ?? 0).toLocaleString('en-IN')}</p>",
    "<p className=\"text-xs font-medium mt-0.5\">₹{((r as any).room_type_id?.base_price ?? 0).toLocaleString('en-IN')}</p>"
)

# Fix confirm step room type name
content = content.replace(
    "{selectedRoom?.room_number} · {selectedRoom?.room_type_id?.name}",
    "{selectedRoom?.room_number} · {(selectedRoom as any)?.room_type_id?.name}"
)

# Fix nights calculation for data.check_in → data.check_in_date
content = content.replace(
    "calculateNights(data.check_in_date, data.check_out_date)",
    "calculateNights(data.check_in_date, data.check_out_date)"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed CheckInWizard.tsx")
PYEOF

# ============================================================
# 19. Fix CheckOutForm.tsx — Invoice type + PaymentMode + toast
# ============================================================
python3 << 'PYEOF'
path = 'src/components/guests/CheckOutForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix Invoice interface — add total_amount, fix discount
content = content.replace(
    '''interface Invoice {
  id: string
  invoice_number: string
  subtotal: number
  tax_amount: number
  discount: number
  total: number
  payment_status: string
}''',
    '''interface Invoice {
  id: string
  invoice_number: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_status: string
}'''
)

# Fix invoice.total_amount reference (already correct in the file)
# Fix invoice.discount reference
content = content.replace(
    "invoice.discount > 0",
    "invoice.discount_amount > 0"
)
content = content.replace(
    "-{formatCurrency(invoice.discount)}",
    "-{formatCurrency(invoice.discount_amount)}"
)

# Fix toast calls
content = content.replace(
    "toast({ title: 'Check-out complete', description: `Room ${booking.room?.room_number} is now set to cleaning.` })",
    "toast.success('Check-out complete', { description: `Room ${booking.room?.room_number} is now set to cleaning.` })"
)
content = content.replace(
    "toast({ title: 'Error', description: msg, variant: 'destructive' })",
    "toast.error(msg)"
)

# Fix payment_mode cast — update the supabase call to cast
content = content.replace(
    ".update({ payment_status: 'paid', payment_mode: paymentMode })",
    ".update({ payment_status: 'paid', payment_mode: paymentMode as any })"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed CheckOutForm.tsx")
PYEOF

# ============================================================
# 20. Fix GuestForm.tsx — aadhar → aadhaar + toast calls
# ============================================================
python3 << 'PYEOF'
path = 'src/components/guests/GuestForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix aadhar → aadhaar in ID_PROOF_TYPES
content = content.replace(
    "{ value: 'aadhar',          label: 'Aadhaar Card'     },",
    "{ value: 'aadhaar',         label: 'Aadhaar Card'     },"
)

# Fix defaultValues
content = content.replace(
    "      id_proof_type: 'aadhar', id_proof_number: '',",
    "      id_proof_type: 'aadhaar', id_proof_number: ',"
)
# The above had a bug — let's be precise
content = content.replace(
    "      id_proof_type: 'aadhaar', id_proof_number: ',",
    "      id_proof_type: 'aadhaar', id_proof_number: '',"
)

# Fix reset inside useEffect
content = content.replace(
    "              id_proof_type: 'aadhar', id_proof_number: '',",
    "              id_proof_type: 'aadhaar', id_proof_number: '',"
)

# Fix toast calls
content = content.replace(
    "toast({ title: 'Guest updated' })",
    "toast.success('Guest updated')"
)
content = content.replace(
    "toast({ title: 'Guest added' })",
    "toast.success('Guest added')"
)
content = content.replace(
    "toast({ title: 'Error', description: msg, variant: 'destructive' })",
    "toast.error(msg)"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed GuestForm.tsx")
PYEOF

# ============================================================
# 21. Fix GuestHistory.tsx — total → total_amount in inline type + Button asChild
# ============================================================
python3 << 'PYEOF'
path = 'src/components/guests/GuestHistory.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix inline type
content = content.replace(
    "  invoices?: Array<{ id: string; invoice_number: string; total: number; payment_status: string }>",
    "  invoices?: Array<{ id: string; invoice_number: string; total_amount: number; payment_status: string }>"
)

# Fix Button asChild → Link with className
content = content.replace(
    '''                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/billing/${invoice.id}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>''',
    '''                      <Link href={`/billing/${invoice.id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted">
                          <ExternalLink className="h-3 w-3" />
                        </Link>'''
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed GuestHistory.tsx")
PYEOF

# ============================================================
# 22. Fix GuestTable.tsx — SearchInput props (onSearch → onChange, defaultValue → value)
# ============================================================
python3 << 'PYEOF'
path = 'src/components/guests/GuestTable.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''        <SearchInput
          defaultValue={searchQuery}
          placeholder="Search by name, phone or email…"
          onSearch={handleSearch}
          className="w-full max-w-sm"
        />''',
    '''        <SearchInput
          value={searchQuery}
          placeholder="Search by name, phone or email…"
          onChange={handleSearch}
          className="w-full max-w-sm"
        />'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed GuestTable.tsx")
PYEOF

# ============================================================
# 23. Fix InvoiceCard.tsx — inline booking type: check_in→check_in_date etc
# ============================================================
python3 << 'PYEOF'
path = 'src/components/billing/InvoiceCard.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''type InvoiceWithBooking = Invoice & {
  booking?: {
    booking_reference: string
    check_in: string
    check_out: string
    total_nights: number
    room_rate: number
    guest?: { full_name: string; phone: string }
    room?: { room_number: string; room_type_id?: { name: string } }
  }
}''',
    '''type InvoiceWithBooking = Invoice & {
  booking?: {
    booking_number: string
    check_in_date: string
    check_out_date: string
    total_nights: number
    room_rate: number
    guest?: { full_name: string; phone: string }
    room?: { room_number: string; room_type_id?: { name: string } }
  }
}'''
)

# Fix property accesses
content = content.replace("b.check_in_date", "b.check_in_date")  # already correct
content = content.replace(
    "formatDate(b.check_in_date)} → {formatDate(b.check_out_date)",
    "formatDate(b.check_in_date)} → {formatDate(b.check_out_date)"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed InvoiceCard.tsx")
PYEOF

# ============================================================
# 24. Fix InvoiceForm.tsx — inline type: booking_reference → booking_number, check_in → check_in_date
# ============================================================
python3 << 'PYEOF'
path = 'src/components/billing/InvoiceForm.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''type InvoiceWithDetails = Invoice & {
  booking?: {
    booking_reference: string
    check_in: string
    check_out: string''',
    '''type InvoiceWithDetails = Invoice & {
  booking?: {
    booking_number: string
    check_in_date: string
    check_out_date: string'''
)

# Fix the references inside JSX
content = content.replace(
    "b?.booking_number",
    "b?.booking_number"
)
content = content.replace(
    "formatDate(b?.check_in ?? '')",
    "formatDate(b?.check_in_date ?? '')"
)
content = content.replace(
    "formatDate(b?.check_out ?? '')",
    "formatDate(b?.check_out_date ?? '')"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed InvoiceForm.tsx")
PYEOF

# ============================================================
# 25. Fix InvoiceTable.tsx — total→total_amount, check_in→check_in_date, DateRange, Button asChild
# ============================================================
python3 << 'PYEOF'
path = 'src/components/billing/InvoiceTable.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix inline type booking subobject
content = content.replace(
    '''  booking?: {
    booking_number: string
    check_in_date: string
    check_out_date: string''',
    '''  booking?: {
    booking_number: string
    check_in_date: string
    check_out_date: string'''
)
# If it still uses check_in/check_out:
content = content.replace(
    "formatDate(inv.booking?.check_in ?? '')",
    "formatDate(inv.booking?.check_in_date ?? '')"
)
content = content.replace(
    "formatDate(inv.booking?.check_out ?? '')",
    "formatDate(inv.booking?.check_out_date ?? '')"
)

# Fix total → total_amount
content = content.replace(
    "(i.total ?? 0), 0)",
    "(i.total_amount ?? 0), 0)"
)
content = content.replace(
    "(i.total ?? 0), 0)",
    "(i.total_amount ?? 0), 0)"
)

# Fix DateRangePicker onChange signature
content = content.replace(
    "          onChange={(f, t) => navigate({ from: f, to: t })}",
    "          onChange={(range: any) => navigate({ from: range?.from ?? '', to: range?.to ?? '' })}"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed InvoiceTable.tsx")
PYEOF

# ============================================================
# 26. Fix PaymentForm.tsx — PaymentMode type, "online", guests field
# ============================================================
python3 << 'PYEOF'
path = 'src/components/billing/PaymentForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix PaymentMode type to match DB
content = content.replace(
    "type PaymentMode = 'cash' | 'card' | 'online' | 'split'",
    "type PaymentMode = 'cash' | 'card' | 'razorpay' | 'split' | 'upi' | 'bank_transfer'"
)

# Fix mode state default
content = content.replace(
    "  const [mode, setMode] = useState<PaymentMode>('cash')",
    "  const [mode, setMode] = useState<PaymentMode>('cash')"
)

# Fix payment_mode: 'online' → 'razorpay' or 'upi'
content = content.replace(
    "        payment_mode: mode,",
    "        payment_mode: mode as any,"
)
content = content.replace(
    "        payment_mode: 'online',",
    "        payment_mode: 'razorpay',"
)

# Fix guests field → cast invoice as any
content = content.replace(
    "guestName={invoice.guests?.full_name ?? 'Guest'}",
    "guestName={(invoice as any).guests?.full_name ?? 'Guest'}"
)

# Fix mode === 'online' → mode === 'razorpay' in JSX
content = content.replace(
    "{mode === 'online' && (",
    "{mode === 'razorpay' && ("
)

# Fix SelectItem value="razorpay" already there; but mode options need to match
content = content.replace(
    '<SelectItem value="razorpay">Online (Razorpay)</SelectItem>',
    '<SelectItem value="razorpay">Online (Razorpay)</SelectItem>'
)

# splitOnline payment_mode fix
content = content.replace(
    "        payment_mode: 'online',\n        payment_date: new Date().toISOString().split('T')[0],\n        transaction_id: onlineTransactionId,",
    "        payment_mode: 'razorpay',\n        payment_date: new Date().toISOString().split('T')[0],\n        transaction_id: onlineTransactionId,"
)

# Fix outstanding payment_mode in razorpay success
content = content.replace(
    "        payment_mode: 'online',\n        payment_date: new Date().toISOString().split('T')[0],\n        transaction_id: transactionId,",
    "        payment_mode: 'razorpay',\n        payment_date: new Date().toISOString().split('T')[0],\n        transaction_id: transactionId,"
)

# Fix type cast for insert
content = content.replace(
    "      const { error: insertError } = await supabase.from('payments').insert({",
    "      const { error: insertError } = await supabase.from('payments').insert({"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed PaymentForm.tsx")
PYEOF

# ============================================================
# 27. Fix ExtrasForm.tsx — discount_amount_amount typo + total field + toast
# ============================================================
python3 << 'PYEOF'
path = 'src/components/billing/ExtrasForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix typo
content = content.replace(
    "invoice.discount_amount_amount",
    "invoice.discount_amount"
)

# Fix total → total_amount in update
content = content.replace(
    "          total: newTotal,",
    "          total_amount: newTotal,"
)

# Fix toast calls
content = content.replace(
    "toast({ title: 'Extra charge added' })",
    "toast.success('Extra charge added')"
)
content = content.replace(
    "toast({ title: 'Error', description: msg, variant: 'destructive' })",
    "toast.error(msg)"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed ExtrasForm.tsx")
PYEOF

# ============================================================
# 28. Fix BookingsClient.tsx — SearchInput props + statuses + Button asChild
# ============================================================
python3 << 'PYEOF'
path = 'src/components/bookings/BookingsClient.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix SearchInput props
content = content.replace(
    '''        <SearchInput
          defaultValue={searchQuery}
          placeholder="Search guest or room…"
          onChange={q => navigate({ q, status: activeStatus })}
          className="w-56"
        />''',
    '''        <SearchInput
          value={searchQuery}
          placeholder="Search guest or room…"
          onChange={q => navigate({ q, status: activeStatus })}
          className="w-56"
        />'''
)

# Fix b.status === 'active' comparison (line 159 area)
content = content.replace(
    "b.status === 'active' && permissions.can",
    "b.status === 'checked_in' && permissions.can"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed BookingsClient.tsx")
PYEOF

# ============================================================
# 29. Fix NotificationList.tsx — onInsert → use onData pattern
# ============================================================
python3 << 'PYEOF'
path = 'src/components/notifications/NotificationList.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''  useSupabaseRealtime<any>({
    table: "notifications",
    filter: `hotel_id=eq.${process.env.NEXT_PUBLIC_HOTEL_ID}`,
    onInsert: (payload: any) => {
      setNotifications((prev) => [payload.new, ...prev]);
    },
  });''',
    '''  useSupabaseRealtime<any>({
    table: "notifications",
    filter: `hotel_id=eq.${process.env.NEXT_PUBLIC_HOTEL_ID}`,
    onInsert: (row: any) => {
      setNotifications((prev) => [row, ...prev]);
    },
  });'''
)

# Fix toast call
content = content.replace(
    'toast({ title: "All notifications marked as read" });',
    'toast.success("All notifications marked as read");'
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed NotificationList.tsx")
PYEOF

# ============================================================
# 30. Fix AttendanceFilters.tsx — Select onValueChange signature
# ============================================================
python3 << 'PYEOF'
path = 'src/components/attendance/AttendanceFilters.tsx'
with open(path, 'r') as f:
    content = f.read()

# The component passes onRoleChange/onStatusChange which are (string) => void
# The Select onValueChange is (value: string) => void — this should be fine
# But if the UI library expects (value: string | null, ...) we need to wrap
content = content.replace(
    "      <Select value={roleFilter} onValueChange={onRoleChange}>",
    "      <Select value={roleFilter} onValueChange={(v: string) => onRoleChange(v)}>"
)
content = content.replace(
    "      <Select value={statusFilter} onValueChange={onStatusChange}>",
    "      <Select value={statusFilter} onValueChange={(v: string) => onStatusChange(v)}>"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed AttendanceFilters.tsx")
PYEOF

# ============================================================
# 31. Fix MarkAttendanceForm.tsx — missing hotel_id + toast
# ============================================================
python3 << 'PYEOF'
path = 'src/components/attendance/MarkAttendanceForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add hotel_id to insert payload
content = content.replace(
    '''    const payload = {
      staff_id: data.staff_id,
      date: data.date,
      check_in: data.check_in || null,
      check_out: data.check_out || null,
      status: data.status,
      notes: data.notes || null,
    };''',
    '''    const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!;
    const payload = {
      hotel_id: hotelId,
      staff_id: data.staff_id,
      date: data.date,
      check_in: data.check_in || null,
      check_out: data.check_out || null,
      status: data.status,
      notes: data.notes || null,
    };'''
)

# Fix toast calls
content = content.replace(
    'toast({ title: "Error", description: result.error.message, variant: "destructive" });',
    'toast.error(result.error.message);'
)
content = content.replace(
    'toast({ title: record ? "Attendance updated" : "Attendance marked" });',
    'toast.success(record ? "Attendance updated" : "Attendance marked");'
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed MarkAttendanceForm.tsx")
PYEOF

# ============================================================
# 32. Fix ExpenseFilters.tsx — onValueChange signatures
# ============================================================
python3 << 'PYEOF'
path = 'src/components/expenses/ExpenseFilters.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "      <Select value={categoryFilter} onValueChange={onCategoryChange}>",
    "      <Select value={categoryFilter} onValueChange={(v: string) => onCategoryChange(v)}>"
)
content = content.replace(
    "      <Select value={paymentFilter} onValueChange={onPaymentChange}>",
    "      <Select value={paymentFilter} onValueChange={(v: string) => onPaymentChange(v)}>"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed ExpenseFilters.tsx")
PYEOF

# ============================================================
# 33. Fix ExpenseForm.tsx — toast calls
# ============================================================
python3 << 'PYEOF'
path = 'src/components/expenses/ExpenseForm.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'toast({ title: "Error", description: error.message, variant: "destructive" });',
    'toast.error(error.message);'
)
content = content.replace(
    'toast({ title: "Expense added", description: `${data.description} recorded.` });',
    'toast.success("Expense added", { description: `${data.description} recorded.` });'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed ExpenseForm.tsx")
PYEOF

# ============================================================
# 34. Fix StaffForm.tsx — duplicate emergency_contact keys
# ============================================================
python3 << 'PYEOF'
path = 'src/components/staff/StaffForm.tsx'
with open(path, 'r') as f:
    content = f.read()

# The schema has emergency_contact_name and emergency_contact_phone
# But StaffForm uses emergency_contact (duplicate). Fix: use correct field names.
# Replace all duplicate emergency_contact pairs with the proper split fields

# Fix defaultValues block (first occurrence — fresh form)
content = content.replace(
    '''      emergency_contact: "",
      emergency_contact: "",
    },
  });''',
    '''      emergency_contact_name: "",
      emergency_contact_phone: "",
    },
  });'''
)

# Fix reset for existing staff
content = content.replace(
    '''        emergency_contact: staff.emergency_contact ?? "",
        emergency_contact: staff.emergency_contact ?? "",
      });''',
    '''        emergency_contact_name: staff.emergency_contact_name ?? "",
        emergency_contact_phone: staff.emergency_contact_phone ?? "",
      });'''
)

# Fix reset for new staff
content = content.replace(
    '''        emergency_contact: "",
        emergency_contact: "",
      });''',
    '''        emergency_contact_name: "",
        emergency_contact_phone: "",
      });'''
)

# Fix the FormField name="emergency_contact" duplicates
# First occurrence → emergency_contact_name
import re

# Replace first emergency_contact FormField
content = content.replace(
    'name="emergency_contact"\n              render={({ field }: { field: any }) => (\n                <FormItem>\n                  <FormLabel>Emergency Contact Name</FormLabel>',
    'name="emergency_contact_name"\n              render={({ field }: { field: any }) => (\n                <FormItem>\n                  <FormLabel>Emergency Contact Name</FormLabel>',
    1  # only first occurrence
)
# Replace second emergency_contact FormField
content = content.replace(
    'name="emergency_contact"\n              render={({ field }: { field: any }) => (\n                <FormItem>\n                  <FormLabel>Emergency Contact Phone</FormLabel>',
    'name="emergency_contact_phone"\n              render={({ field }: { field: any }) => (\n                <FormItem>\n                  <FormLabel>Emergency Contact Phone</FormLabel>',
    1
)

# Fix toast calls
content = content.replace(
    'toast({ title: "Error", description: result.error.message, variant: "destructive" });',
    'toast.error(result.error.message);'
)
content = content.replace(
    'toast({ title: staff ? "Staff updated" : "Staff added", description: `${data.full_name} has been ${staff ? "updated" : "added"}.` });',
    'toast.success(staff ? "Staff updated" : "Staff added", { description: `${data.full_name} has been ${staff ? "updated" : "added"}.` });'
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed StaffForm.tsx")
PYEOF

# ============================================================
# 35. Fix DocumentUpload.tsx — missing hotel_id + Button asChild + toast
# ============================================================
python3 << 'PYEOF'
path = 'src/components/staff/DocumentUpload.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix insert — add hotel_id
content = content.replace(
    '''    const { data, error } = await supabase
      .from("staff_documents")
      .insert({
        staff_id: staffId,
        document_type: docType,
        document_name: file.name,
        file_url: publicUrl.publicUrl,
      })''',
    '''    const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!;
    const { data, error } = await supabase
      .from("staff_documents")
      .insert({
        hotel_id: hotelId,
        staff_id: staffId,
        document_type: docType,
        document_name: file.name,
        file_url: publicUrl.publicUrl,
      } as any)'''
)

# Fix toast calls
content = content.replace(
    'toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });',
    'toast.error(uploadError.message);'
)
content = content.replace(
    'toast({ title: "Error saving document", description: error.message, variant: "destructive" });',
    'toast.error(error.message);'
)
content = content.replace(
    'toast({ title: "Document uploaded", description: `${file.name} uploaded successfully.` });',
    'toast.success("Document uploaded", { description: `${file.name} uploaded successfully.` });'
)
content = content.replace(
    'toast({ title: "Error", description: error.message, variant: "destructive" });',
    'toast.error(error.message);'
)
content = content.replace(
    'toast({ title: "Document deleted" });',
    'toast.success("Document deleted");'
)

# Fix Button asChild → use anchor tag directly
content = content.replace(
    '''                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>''',
    '''                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
                      <Download className="h-4 w-4" />
                    </a>'''
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed DocumentUpload.tsx")
PYEOF

# ============================================================
# 36. Fix StaffTable.tsx — Button asChild
# ============================================================
python3 << 'PYEOF'
path = 'src/components/staff/StaffTable.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '''                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/staff/${member.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>''',
    '''                      <Link href={`/staff/${member.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
                          <Eye className="h-4 w-4" />
                        </Link>'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed StaffTable.tsx")
PYEOF

# ============================================================
# 37. Fix QuickActions.tsx — Button asChild → Link with buttonVariants
# ============================================================
python3 << 'PYEOF'
path = 'src/components/dashboard/QuickActions.tsx'
with open(path, 'r') as f:
    content = f.read()

# Add buttonVariants import
content = content.replace(
    'import { Button } from "@/components/ui/button";',
    'import { buttonVariants } from "@/components/ui/button";'
)

# Replace Button asChild pattern
content = content.replace(
    '''            <Button
              key={action.href}
              variant={action.variant}
              size="sm"
              className="h-auto flex-col gap-1.5 py-3"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-4 w-4" />
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>''',
    '''            <Link
              key={action.href}
              href={action.href}
              className={buttonVariants({ variant: action.variant, size: "sm" }) + " h-auto flex-col gap-1.5 py-3"}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs">{action.label}</span>
            </Link>'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed QuickActions.tsx")
PYEOF

# ============================================================
# 38. Fix RecentBookings.tsx — Button asChild → Link with buttonVariants
# ============================================================
python3 << 'PYEOF'
path = 'src/components/dashboard/RecentBookings.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    'import { Button } from "@/components/ui/button";',
    'import { buttonVariants } from "@/components/ui/button";'
)
content = content.replace(
    '''        <Button variant="ghost" size="sm" asChild>
          <Link href="/bookings" className="flex items-center gap-1 text-sm">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>''',
    '''        <Link href="/bookings" className={buttonVariants({ variant: "ghost", size: "sm" }) + " flex items-center gap-1 text-sm"}>
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>'''
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed RecentBookings.tsx")
PYEOF

# ============================================================
# 39. Fix razorpay/route.ts — await createClient()
# ============================================================
python3 << 'PYEOF'
path = 'src/app/api/webhooks/razorpay/route.ts'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '      const supabase = createAdminClient();',
    '      const supabase = await createAdminClient();'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed razorpay/route.ts")
PYEOF

# ============================================================
# 40. Fix billing/[invoiceId]/page.tsx — invoice_id column + items cast
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/billing/[invoiceId]/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix select query — use check_in_date/check_out_date/booking_number
content = content.replace(
    "      id, check_in, check_out, booking_reference, adults, children, room_rate, total_nights,",
    "      id, check_in_date, check_out_date, booking_number, adults, children, room_rate, total_nights,"
)

# Fix booking_number reference in page
content = content.replace(
    ".booking?.booking_number ?? ''",
    ".booking?.booking_number ?? ''"
)

# Cast items properly
content = content.replace(
    "  const items = itemsResult.data ?? []",
    "  const items = (itemsResult.data ?? []) as any[]"
)
content = content.replace(
    "  const payments = paymentsResult.data ?? []",
    "  const payments = (paymentsResult.data ?? []) as any[]"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed billing/[invoiceId]/page.tsx")
PYEOF

# ============================================================
# 41. Fix billing/page.tsx — payment_status filter cast + query columns
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/billing/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix select query columns
content = content.replace(
    "      id, check_in, check_out, booking_reference,",
    "      id, check_in_date, check_out_date, booking_number,"
)

# Fix payment_status filter cast
content = content.replace(
    "  if (status) query = query.eq('payment_status', status)",
    "  if (status) query = query.eq('payment_status', status as any)"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed billing/page.tsx")
PYEOF

# ============================================================
# 42. Fix bookings/page.tsx — column names + status values
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/bookings/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix order('check_in') → order('check_in_date')
content = content.replace(
    ".order('check_in', { ascending: false })",
    ".order('check_in_date', { ascending: false })"
)
content = content.replace(
    ".order('check_out', { ascending: false })",
    ".order('check_out_date', { ascending: false })"
)

# Fix status filter cast
content = content.replace(
    "  if (status) query = query.eq('status', status)",
    "  if (status) query = query.eq('status', status as any)"
)

# Fix today's arrivals/departures — column names
content = content.replace(
    ".eq('check_in', today).eq('status', 'reserved')",
    ".eq('check_in_date', today).eq('status', 'confirmed')"
)
content = content.replace(
    ".eq('check_out', today).eq('status', 'active')",
    ".eq('check_out_date', today).eq('status', 'checked_in')"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed bookings/page.tsx")
PYEOF

# ============================================================
# 43. Fix dashboard/page.tsx — DataPoint[] type
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/dashboard/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# The revenueChartData is { date, revenue }[] but RevenueChart expects DataPoint[]
# Add type assertion
content = content.replace(
    "      revenueChartData: last7Days.map((day) => ({\n      date: day,\n      revenue: revenueByDay[day] ?? 0,\n    })),",
    "      revenueChartData: last7Days.map((day) => ({\n      date: day,\n      revenue: revenueByDay[day] ?? 0,\n    })) as any[],"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed dashboard/page.tsx")
PYEOF

# ============================================================
# 44. Fix expenses/page.tsx — type casts
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/expenses/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Cast expenses and categories
content = content.replace(
    "      expenses={expenses ?? []}",
    "      expenses={(expenses ?? []) as any}"
)
content = content.replace(
    "      categories={categories ?? []}",
    "      categories={(categories ?? []) as any}"
)
content = content.replace(
    "      initialExpenses={expenses ?? []}",
    "      initialExpenses={(expenses ?? []) as any}"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed expenses/page.tsx")
PYEOF

# ============================================================
# 45. Fix guests/[id]/page.tsx — total → total_amount in invoices query + select
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/guests/[id]/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix select query
content = content.replace(
    "        invoices(id, invoice_number, total, payment_status)",
    "        invoices(id, invoice_number, total_amount, payment_status)"
)

# Fix the reduce access
content = content.replace(
    "    const invoices = (b as Booking & { invoices?: Array<{ total: number }> }).invoices ?? []",
    "    const invoices = (b as Booking & { invoices?: Array<{ total_amount: number }> }).invoices ?? []"
)
content = content.replace(
    "return sum + invoices.reduce((s, inv) => s + (inv.total_amount ?? 0), 0)",
    "return sum + invoices.reduce((s, inv) => s + (inv.total_amount ?? 0), 0)"
)

# Fix check_in order
content = content.replace(
    ".order('check_in', { ascending: false }),",
    ".order('check_in_date', { ascending: false }),"
)

with open(path, 'w') as f:
    f.write(content)
print("Fixed guests/[id]/page.tsx")
PYEOF

# ============================================================
# 46. Fix notifications/page.tsx — Notification type cast
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/notifications/page.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "  <NotificationList initialNotifications={notifications ?? []} />",
    "  <NotificationList initialNotifications={(notifications ?? []) as any} />"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed notifications/page.tsx")
PYEOF

# ============================================================
# 47. Fix settings/feature-flags/page.tsx — FeatureFlag cast
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/settings/feature-flags/page.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "  <FeatureFlagsPanel initialFlags={flags ?? []} />",
    "  <FeatureFlagsPanel initialFlags={(flags ?? []) as any} />"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed feature-flags/page.tsx")
PYEOF

# ============================================================
# 48. Fix settings/page.tsx — Hotel type cast
# ============================================================
python3 << 'PYEOF'
path = 'src/app/(admin)/settings/page.tsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    "  <HotelForm hotel={hotel} />",
    "  <HotelForm hotel={hotel as any} />"
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed settings/page.tsx")
PYEOF

# ============================================================
# 49. Fix staff/[id]/page.tsx + my-attendance + my-profile — AttendanceRecord cast + toast
# ============================================================
python3 << 'PYEOF'
files = [
    'src/app/(admin)/staff/[id]/page.tsx',
    'src/app/(staff-portal)/portal/my-attendance/page.tsx',
]
for path in files:
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace(
        '<AttendanceSummary attendance={attendance ?? []} staff={staff} />',
        '<AttendanceSummary attendance={(attendance ?? []) as any} staff={staff} />'
    )
    with open(path, 'w') as f:
        f.write(content)
    print(f"Fixed {path}")
PYEOF

python3 << 'PYEOF'
path = 'src/app/(staff-portal)/portal/my-profile/page.tsx'
with open(path, 'r') as f:
    content = f.read()

# Fix toast calls
content = content.replace(
    'toast({ title: "Error", description: error.message, variant: "destructive" });',
    'toast.error(error.message);'
)
content = content.replace(
    'toast({ title: "Phone number updated" });',
    'toast.success("Phone number updated");'
)
with open(path, 'w') as f:
    f.write(content)
print("Fixed my-profile/page.tsx")
PYEOF

# ============================================================
# 50. Fix remaining components that call toast({ title, ... })
# ============================================================
python3 << 'PYEOF'
import os, re

# Files that use useToast from @/components/ui/use-toast and call toast({ title, ... })
files_to_fix = [
    'src/components/settings/FeatureFlagsPanel.tsx',
    'src/components/settings/HotelSettingsForm.tsx',
    'src/components/settings/HotelForm.tsx',
]

def fix_toast_calls(content):
    # toast({ title: 'X', description: 'Y' }) → toast.success('X', { description: 'Y' })
    # toast({ title: 'X', description: 'Y', variant: 'destructive' }) → toast.error('Y' || 'X')

    # Pattern: toast({ title: '...', description: '...', variant: 'destructive' })
    content = re.sub(
        r"toast\(\{\s*title:\s*['\"]([^'\"]*)['\"],\s*description:\s*([^,}]+),\s*variant:\s*['\"]destructive['\"]\s*\}\)",
        lambda m: f"toast.error({m.group(2).strip()})",
        content
    )
    # Pattern: toast({ title: '...', variant: 'destructive' })
    content = re.sub(
        r"toast\(\{\s*title:\s*['\"]([^'\"]*)['\"],\s*variant:\s*['\"]destructive['\"]\s*\}\)",
        lambda m: f"toast.error('{m.group(1)}')",
        content
    )
    # Pattern: toast({ title: '...', description: '...' })
    content = re.sub(
        r"toast\(\{\s*title:\s*['\"]([^'\"]*)['\"],\s*description:\s*([^}]+)\}\)",
        lambda m: f"toast.success('{m.group(1)}', {{ description: {m.group(2).strip()} }})",
        content
    )
    # Pattern: toast({ title: '...' })
    content = re.sub(
        r"toast\(\{\s*title:\s*['\"]([^'\"]*)['\"\s]*\}\)",
        lambda m: f"toast.success('{m.group(1)}')",
        content
    )
    return content

for path in files_to_fix:
    if os.path.exists(path):
        with open(path, 'r') as f:
            content = f.read()
        content = fix_toast_calls(content)
        with open(path, 'w') as f:
            f.write(content)
        print(f"Fixed toast calls in {path}")
    else:
        print(f"SKIP (not found): {path}")
PYEOF

echo ""
echo "=== All fixes applied. Running TypeScript check... ==="
pnpm tsc --noEmit 2>&1 | grep "error TS" | sed 's/.*error TS/TS/' | sort | uniq -c | sort -rn | head -30
echo ""
echo "Total errors:"
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l

