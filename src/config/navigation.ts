import type { Role } from '@/constants/roles'
import type { Permission } from '@/config/permissions'

export interface NavItem {
  title:       string
  href:        string
  icon:        string
  permission:  Permission
  badge?:      string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const ADMIN_NAVIGATION: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        title:      'Dashboard',
        href:       '/dashboard',
        icon:       'LayoutDashboard',
        permission: 'view:dashboard',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        title:      'Rooms',
        href:       '/rooms',
        icon:       'BedDouble',
        permission: 'view:rooms',
      },
      {
        title:      'Bookings',
        href:       '/bookings',
        icon:       'CalendarCheck',
        permission: 'view:bookings',
      },
      {
        title:      'Guests',
        href:       '/guests',
        icon:       'Users',
        permission: 'view:guests',
      },
      {
        title:      'Billing',
        href:       '/billing',
        icon:       'Receipt',
        permission: 'view:billing',
      },
    ],
  },
  {
    title: 'Staff',
    items: [
      {
        title:      'Staff',
        href:       '/staff',
        icon:       'UserCog',
        permission: 'view:staff',
      },
      {
        title:      'Attendance',
        href:       '/attendance',
        icon:       'ClipboardCheck',
        permission: 'view:attendance',
      },
      {
        title:      'Expenses',
        href:       '/expenses',
        icon:       'Wallet',
        permission: 'view:expenses',
      },
    ],
  },
  {
    title: 'Insights',
    items: [
      {
        title:      'Analytics',
        href:       '/analytics',
        icon:       'BarChart3',
        permission: 'view:analytics',
      },
      {
        title:      'Notifications',
        href:       '/notifications',
        icon:       'Bell',
        permission: 'view:notifications',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title:      'Settings',
        href:       '/settings',
        icon:       'Settings',
        permission: 'view:settings',
      },
    ],
  },
]

export const STAFF_PORTAL_NAVIGATION: NavItem[] = [
  {
    title:      'My Dashboard',
    href:       '/portal',
    icon:       'LayoutDashboard',
    permission: 'view:notifications',
  },
  {
    title:      'My Attendance',
    href:       '/portal/my-attendance',
    icon:       'ClipboardCheck',
    permission: 'view:attendance',
  },
  {
    title:      'My Tasks',
    href:       '/portal/my-tasks',
    icon:       'ListTodo',
    permission: 'view:notifications',
  },
  {
    title:      'My Profile',
    href:       '/portal/my-profile',
    icon:       'UserCircle',
    permission: 'view:notifications',
  },
]

export function getNavigationForRole(role: Role): NavGroup[] {
  const { ROLE_PERMISSIONS } = require('@/config/permissions')
  const permissions: Permission[] = ROLE_PERMISSIONS[role] ?? []

  return ADMIN_NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      permissions.includes(item.permission)
    ),
  })).filter((group) => group.items.length > 0)
}
