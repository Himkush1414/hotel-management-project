'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, Receipt,
  UserCog, ClipboardCheck, Wallet, BarChart3, Bell, Settings,
  LogOut, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { ROLE_LABELS } from '@/constants/roles'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FeatureFlags } from '@/config/featureFlags'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, BedDouble, CalendarCheck, Users, Receipt,
  UserCog, ClipboardCheck, Wallet, BarChart3, Bell, Settings,
}

interface NavItem {
  title:      string
  href:       string
  icon:       string
  flagKey?:   keyof FeatureFlags
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard',     href: '/dashboard',     icon: 'LayoutDashboard' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Rooms',         href: '/rooms',         icon: 'BedDouble',      flagKey: 'ROOM_MANAGEMENT' },
      { title: 'Bookings',      href: '/bookings',      icon: 'CalendarCheck',  flagKey: 'BOOKING_MANAGEMENT' },
      { title: 'Guests',        href: '/guests',        icon: 'Users',          flagKey: 'GUEST_MANAGEMENT' },
      { title: 'Billing',       href: '/billing',       icon: 'Receipt',        flagKey: 'BILLING' },
    ],
  },
  {
    title: 'Staff',
    items: [
      { title: 'Staff',         href: '/staff',         icon: 'UserCog',        flagKey: 'STAFF_MANAGEMENT' },
      { title: 'Attendance',    href: '/attendance',    icon: 'ClipboardCheck', flagKey: 'ATTENDANCE_TRACKING' },
      { title: 'Expenses',      href: '/expenses',      icon: 'Wallet',         flagKey: 'EXPENSE_TRACKING' },
    ],
  },
  {
    title: 'Insights',
    items: [
      { title: 'Analytics',     href: '/analytics',     icon: 'BarChart3',      flagKey: 'ANALYTICS_DASHBOARD' },
      { title: 'Notifications', href: '/notifications', icon: 'Bell',           flagKey: 'NOTIFICATIONS' },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings',      href: '/settings',      icon: 'Settings' },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname              = usePathname()
  const { profile, signOut }  = useAuth()
  const { isEnabled }         = useFeatureFlags()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??'

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-slate-800',
        collapsed && 'justify-center px-2'
      )}>
        <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" className="w-4 h-4 text-slate-900">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">HotelOS</p>
            <p className="text-slate-400 text-xs mt-0.5">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navigation.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.flagKey || isEnabled(item.flagKey)
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.title}>
              {!collapsed && (
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
                  {group.title}
                </p>
              )}
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon      = iconMap[item.icon] ?? LayoutDashboard
                  const isActive  = pathname === item.href || pathname.startsWith(item.href + '/')

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-white text-slate-900'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800',
                          collapsed && 'justify-center px-2'
                        )}
                      >
                        <Icon className="flex-shrink-0 w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-800 p-3">
        <div className={cn(
          'flex items-center gap-3 p-2 rounded-lg',
          collapsed && 'justify-center'
        )}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-slate-700 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {profile?.full_name ?? 'User'}
              </p>
              <p className="text-slate-400 text-xs truncate">
                {profile?.role ? ROLE_LABELS[profile.role] : ''}
              </p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="flex-shrink-0 w-7 h-7 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full mt-2 text-slate-500 hover:text-white hover:bg-slate-800 text-xs',
            collapsed && 'px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col flex-shrink-0 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </Button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
