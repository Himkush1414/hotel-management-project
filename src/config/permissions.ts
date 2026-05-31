import type { Role } from '@/constants/roles'

export type Permission =
  | 'view:dashboard'
  | 'view:staff'
  | 'create:staff'
  | 'edit:staff'
  | 'delete:staff'
  | 'view:attendance'
  | 'mark:attendance'
  | 'delete:attendance'
  | 'view:rooms'
  | 'create:room'
  | 'edit:room'
  | 'delete:room'
  | 'update:room_status'
  | 'view:guests'
  | 'create:guest'
  | 'edit:guest'
  | 'delete:guest'
  | 'view:bookings'
  | 'create:booking'
  | 'edit:booking'
  | 'delete:booking'
  | 'view:billing'
  | 'create:invoice'
  | 'edit:invoice'
  | 'delete:invoice'
  | 'record:payment'
  | 'view:expenses'
  | 'create:expense'
  | 'edit:expense'
  | 'delete:expense'
  | 'view:analytics'
  | 'view:settings'
  | 'edit:settings'
  | 'view:feature_flags'
  | 'edit:feature_flags'
  | 'view:audit_logs'
  | 'view:notifications'

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view:dashboard',
    'view:staff', 'create:staff', 'edit:staff', 'delete:staff',
    'view:attendance', 'mark:attendance', 'delete:attendance',
    'view:rooms', 'create:room', 'edit:room', 'delete:room', 'update:room_status',
    'view:guests', 'create:guest', 'edit:guest', 'delete:guest',
    'view:bookings', 'create:booking', 'edit:booking', 'delete:booking',
    'view:billing', 'create:invoice', 'edit:invoice', 'delete:invoice', 'record:payment',
    'view:expenses', 'create:expense', 'edit:expense', 'delete:expense',
    'view:analytics',
    'view:settings', 'edit:settings',
    'view:feature_flags', 'edit:feature_flags',
    'view:audit_logs',
    'view:notifications',
  ],
  manager: [
    'view:dashboard',
    'view:staff', 'create:staff', 'edit:staff',
    'view:attendance', 'mark:attendance',
    'view:rooms', 'create:room', 'edit:room', 'update:room_status',
    'view:guests', 'create:guest', 'edit:guest',
    'view:bookings', 'create:booking', 'edit:booking',
    'view:billing', 'create:invoice', 'edit:invoice', 'record:payment',
    'view:expenses', 'create:expense', 'edit:expense',
    'view:analytics',
    'view:settings',
    'view:feature_flags',
    'view:audit_logs',
    'view:notifications',
  ],
  receptionist: [
    'view:dashboard',
    'view:attendance', 'mark:attendance',
    'view:rooms', 'update:room_status',
    'view:guests', 'create:guest', 'edit:guest',
    'view:bookings', 'create:booking', 'edit:booking',
    'view:billing', 'create:invoice', 'edit:invoice', 'record:payment',
    'view:notifications',
  ],
  housekeeping: [
    'view:rooms', 'update:room_status',
    'view:notifications',
  ],
  security: [
    'view:rooms',
    'view:notifications',
  ],
  kitchen: [
    'view:rooms',
    'view:notifications',
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}
