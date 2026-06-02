'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Plus, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { SearchInput } from '@/components/ui/SearchInput'
import { CheckInWizard } from '@/components/guests/CheckInWizard'
import { CheckOutForm } from '@/components/guests/CheckOutForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePermissions } from '@/hooks/usePermissions'
import { formatDate, formatCurrency, calculateNights } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Booking } from '@/types/booking'

const STATUS_TABS = [
  { value: '',           label: 'All'         },
  { value: 'reserved',   label: 'Reserved'    },
  { value: 'active',     label: 'Checked In'  },
  { value: 'checked_out',label: 'Checked Out' },
  { value: 'cancelled',  label: 'Cancelled'   },
]

const STATUS_BADGE: Record<string, string> = {
  reserved:    'bg-purple-100 text-purple-800 border-purple-200',
  active:      'bg-blue-100 text-blue-800 border-blue-200',
  checked_out: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelled:   'bg-red-100 text-red-800 border-red-200',
  no_show:     'bg-orange-100 text-orange-800 border-orange-200',
}

type BookingRow = Booking & {
  guest?: { id: string; full_name: string; phone: string }
  room?: { id: string; room_number: string; room_type_id?: { name: string } }
}

interface BookingsClientProps {
  bookings: BookingRow[]
  todayArrivals: string[]
  todayDepartures: string[]
  activeStatus: string
  searchQuery: string
}

export function BookingsClient({
  bookings, todayArrivals, todayDepartures, activeStatus, searchQuery,
}: BookingsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [checkOutBooking, setCheckOutBooking] = useState<BookingRow | null>(null)
  const permissions = usePermissions()

  const navigate = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(updates).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k))
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={activeStatus} onValueChange={v => navigate({ status: v, q: '' })}>
          <TabsList>
            {STATUS_TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <SearchInput
          value={searchQuery}
          placeholder="Search guest or room…"
          onChange={q => navigate({ q, status: activeStatus })}
          className="w-56"
        />
        {permissions.can("CREATE_BOOKING") && (
          <Button size="sm" className="ml-auto" onClick={() => setIsCheckInOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Check In
          </Button>
        )}
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="Try a different filter or create a new booking."
          action={permissions.can("CREATE_BOOKING") ? { label: 'New Check-In', onClick: () => setIsCheckInOpen(true) } : undefined}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map(b => {
                const isArriving   = todayArrivals.includes(b.id)
                const isDeparting  = todayDepartures.includes(b.id)
                const nights       = calculateNights(b.check_in_date, b.check_out_date)
                return (
                  <TableRow
                    key={b.id}
                    className={cn(
                      isArriving  && 'bg-emerald-50/50 dark:bg-emerald-950/20',
                      isDeparting && 'bg-amber-50/50 dark:bg-amber-950/20'
                    )}
                  >
                    <TableCell className="font-mono text-xs font-medium">{b.booking_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{b.guest?.full_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{b.guest?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{b.room?.room_number ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{b.room?.room_type_id?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(b.check_in_date)}
                      {isArriving && (
                        <Badge variant="outline" className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">Today</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(b.check_out_date)}
                      {isDeparting && (
                        <Badge variant="outline" className="ml-2 text-[10px] bg-amber-100 text-amber-700 border-amber-200">Today</Badge>
                      )}
                    </TableCell>
                    <TableCell>{nights}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_BADGE[b.status] ?? ''}>
                        {b.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {b.status === 'checked_in' && permissions.can("CREATE_BOOKING") && (
                        <Button size="sm" variant="outline" onClick={() => setCheckOutBooking(b)}>
                          <LogOut className="mr-1 h-3 w-3" />
                          Check Out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <CheckInWizard
        open={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSuccess={() => { setIsCheckInOpen(false); router.refresh() }}
      />

      {checkOutBooking && (
        <CheckOutForm
          booking={checkOutBooking}
          open={!!checkOutBooking}
          onClose={() => setCheckOutBooking(null)}
          onSuccess={() => { setCheckOutBooking(null); router.refresh() }}
        />
      )}
    </div>
  )
}
