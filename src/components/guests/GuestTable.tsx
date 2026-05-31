'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { UserPlus, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GuestForm } from './GuestForm'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePermissions } from '@/hooks/usePermissions'
import { formatDate } from '@/lib/utils'
import type { Guest } from '@/types/guest'

interface GuestTableProps {
  guests: Guest[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  searchQuery: string
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function GuestTable({
  guests: initialGuests,
  total,
  page,
  totalPages,
  searchQuery,
}: GuestTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [guests, setGuests] = useState<Guest[]>(initialGuests)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { canManageGuests } = usePermissions()

  useEffect(() => { setGuests(initialGuests) }, [initialGuests])

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString())
      Object.entries(updates).forEach(([k, v]) => {
        v ? next.set(k, v) : next.delete(k)
      })
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router]
  )

  const handleSearch = (q: string) => navigate({ q, page: '1' })
  const goToPage = (p: number) => navigate({ page: String(p) })

  const handleSaved = (g: Guest) => {
    setGuests(prev => {
      const exists = prev.some(x => x.id === g.id)
      return exists ? prev.map(x => x.id === g.id ? g : x) : [g, ...prev]
    })
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          defaultValue={searchQuery}
          placeholder="Search by name, phone or email…"
          onSearch={handleSearch}
          className="w-full max-w-sm"
        />
        {canManageGuests && (
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Guest
          </Button>
        )}
      </div>

      {guests.length === 0 ? (
        <EmptyState
          title="No guests found"
          description={searchQuery ? 'Try a different search term.' : 'Add your first guest to get started.'}
          action={canManageGuests ? { label: 'Add Guest', onClick: () => setIsFormOpen(true) } : undefined}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>ID Proof</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map(g => (
                <TableRow
                  key={g.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/guests/${g.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{getInitials(g.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{g.full_name}</p>
                        {g.email && <p className="text-xs text-muted-foreground">{g.email}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{g.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {g.id_proof_type?.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[g.city, g.state].filter(Boolean).join(', ') || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={e => { e.stopPropagation(); router.push(`/guests/${g.id}`) }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {guests.length} of {total} guests</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              Previous
            </Button>
            <span className="flex items-center px-2">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <GuestForm
        guest={null}
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
