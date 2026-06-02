import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDate, formatCurrency, calculateNights } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Booking } from '@/types/booking'

type BookingWithExtras = Booking & {
  room?: { room_number: string; room_type_id?: { name: string } }
  invoices?: Array<{ id: string; invoice_number: string; total_amount: number; payment_status: string }>
}

const PAYMENT_BADGE: Record<string, string> = {
  paid:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  partial: 'bg-orange-100 text-orange-800 border-orange-200',
}

const STATUS_BADGE: Record<string, string> = {
  active:      'bg-blue-100 text-blue-800 border-blue-200',
  checked_out: 'bg-slate-100 text-slate-800 border-slate-200',
  cancelled:   'bg-red-100 text-red-800 border-red-200',
  reserved:    'bg-purple-100 text-purple-800 border-purple-200',
}

interface GuestHistoryProps {
  bookings: BookingWithExtras[]
}

export function GuestHistory({ bookings }: GuestHistoryProps) {
  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState title="No stay history" description="This guest has no bookings yet." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Stay History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Nights</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map(b => {
              const nights = calculateNights(b.check_in_date, b.check_out_date)
              const invoice = (b.invoices ?? [])[0]
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{b.room?.room_number ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{b.room?.room_type_id?.name ?? ''}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(b.check_in_date)}</TableCell>
                  <TableCell className="text-sm">{formatDate(b.check_out_date)}</TableCell>
                  <TableCell>{nights}</TableCell>
                  <TableCell className="font-medium">
                    {invoice ? formatCurrency(invoice.total_amount) : '—'}
                  </TableCell>
                  <TableCell>
                    {invoice ? (
                      <Badge variant="outline" className={PAYMENT_BADGE[invoice.payment_status] ?? ''}>
                        {invoice.payment_status}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className={STATUS_BADGE[b.status] ?? ''}>
                        {b.status.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice && (
                      <Link href={`/billing/${invoice.id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted">
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
