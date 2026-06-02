'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ROLE_LABELS } from '@/constants/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export function UserMenu() {
  const { profile, signOut } = useAuth()

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild {...({} as any)}>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors outline-none">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-slate-700 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-900 leading-none">
              {profile?.full_name ?? 'User'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile?.role ? ROLE_LABELS[profile.role] : ''}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium text-slate-900">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {profile?.role ? ROLE_LABELS[profile.role] : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild {...({} as any)}>
            <Link href="/settings" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild {...({} as any)}>
            <Link href="/settings" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={signOut}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
