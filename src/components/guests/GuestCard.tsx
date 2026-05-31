'use client'

import { useState } from 'react'
import { Pencil, Phone, Mail, CreditCard, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { GuestForm } from './GuestForm'
import { usePermissions } from '@/hooks/usePermissions'
import type { Guest } from '@/types/guest'

interface GuestCardProps {
  guest: Guest
  totalStays: number
  totalSpent: number
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const ID_PROOF_LABELS: Record<string, string> = {
  aadhar: 'Aadhaar', passport: 'Passport',
  driving_license: 'Driving License', voter_id: 'Voter ID', pan_card: 'PAN',
}

export function GuestCard({ guest, totalStays, totalSpent }: GuestCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentGuest, setCurrentGuest] = useState<Guest>(guest)
  const { canManageGuests } = usePermissions()

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(currentGuest.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{currentGuest.full_name}</h2>
                <Badge variant="outline" className="mt-1 text-xs">
                  {ID_PROOF_LABELS[currentGuest.id_proof_type] ?? currentGuest.id_proof_type}
                </Badge>
              </div>
            </div>
            {canManageGuests && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditOpen(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{currentGuest.phone}</span>
            </div>
            {currentGuest.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{currentGuest.email}</span>
              </div>
            )}
            <div className="flex items-start gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{currentGuest.id_proof_number}</span>
            </div>
            {(currentGuest.city || currentGuest.state) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{[currentGuest.city, currentGuest.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold">{totalStays}</p>
              <p className="text-xs text-muted-foreground">Total Stays</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <GuestForm
        guest={currentGuest}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSaved={g => { setCurrentGuest(g); setIsEditOpen(false) }}
      />
    </>
  )
}
