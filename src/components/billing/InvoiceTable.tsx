'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Eye, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DateRangePicker } from '@/components/ui/DateRangePicker'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExtrasForm } from './ExtrasForm'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types/billing'

const STATUS_TABS = [
  { value: '',        label: 'All'     },
  { value: 'paid',    label: 'Paid'    },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
]

const PAYMENT_BADGE: Record<string, string> = {
  paid:    'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  partial: 'bg-orange-100 text-orange-800 border-orange-200',
}

type InvoiceRow = Invoice & {
  booking?: {
    booking_number: string
    check_in_date: string
    check_out_date: string
    guest?: { full_name: string }
    room?: { room_number: string }
  }
}

interface InvoiceTableProps {
  invoices: InvoiceRow[]
  activeStatus: string
  fromDate: string
  toDate: string
}

export function InvoiceTable({ invoices, activeStatus, fromDate, toDate }: InvoiceTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [extrasInvoice, setExtrasInvoice] = useState<InvoiceRow | null>(null)

  const navigate = (updates: Record<string, string>) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(updates).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k))
    router.push(`${pathname}?${next.toString()}`)
  }

  const totalAmount = invoices.reduce((s, i) => s + (i.total_amount ?? 0), 0)
  const paidAmount  = invoices.filter(i => i.payment_status === 'paid').reduce((s, i) => s + (i.total_amount ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-muted-foreground">Total Invoiced</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 p-4">
          <p className="text-muted-foreground">Collected</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(paidAmount)}</p>
        </div>
        <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-4">
          <p className="text-muted-foreground">Pending</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(totalAmount - paidAmount)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={activeStatus} onValueChange={v => navigate({ status: v })}>
          <TabsList>
            {STATUS_TABS.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <DateRangePicker
          value={{ from: fromDate, to: toDate }}
          onChange={(range) => navigate({ from: range.from, to: range.to })}
        />
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices found" description="Try adjusting the filters." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/billing/${inv.id}`)}>
                  <TableCell className="font-mono text-xs font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{inv.booking?.guest?.full_name ?? '—'}</p>
                  </TableCell>
                  <TableCell className="text-sm">{inv.booking?.room?.room_number ?? '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(inv.booking?.check_in_date ?? '')} – {formatDate(inv.booking?.check_out_date ?? '')}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(inv.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={PAYMENT_BADGE[inv.payment_status] ?? ''}>
                      {inv.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/billing/${inv.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExtrasInvoice(inv)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {extrasInvoice && (
        <ExtrasForm
          invoice={extrasInvoice}
          open={!!extrasInvoice}
          onClose={() => setExtrasInvoice(null)}
          onSaved={() => { setExtrasInvoice(null); router.refresh() }}
        />
      )}
    </div>
  )
}
