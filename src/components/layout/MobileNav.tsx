'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardCheck, ListTodo, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { title: 'Home',       href: '/portal',               icon: LayoutDashboard },
  { title: 'Attendance', href: '/portal/my-attendance', icon: ClipboardCheck  },
  { title: 'Tasks',      href: '/portal/my-tasks',      icon: ListTodo        },
  { title: 'Profile',    href: '/portal/my-profile',    icon: UserCircle      },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon     = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-slate-900' : 'text-slate-400'
              )} />
              <span>{item.title}</span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-slate-900 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
