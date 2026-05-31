'use client'

import { usePathname } from 'next/navigation'
import { UserMenu } from '@/components/layout/UserMenu'
import { NotificationBell } from '@/components/layout/NotificationBell'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const routeTitles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/rooms':         'Rooms',
  '/bookings':      'Bookings',
  '/guests':        'Guests',
  '/billing':       'Billing',
  '/staff':         'Staff',
  '/attendance':    'Attendance',
  '/expenses':      'Expenses',
  '/analytics':     'Analytics',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
}

export function Header() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const pageTitle = routeTitles['/' + segments[0]] ?? segments[0] ?? 'Dashboard'

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-slate-500 text-sm">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.length > 0 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-900 text-sm font-medium">
                    {pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
