export const ROLES = {
  ADMIN:        'admin',
  MANAGER:      'manager',
  RECEPTIONIST: 'receptionist',
  HOUSEKEEPING: 'housekeeping',
  SECURITY:     'security',
  KITCHEN:      'kitchen',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  admin:        'Admin',
  manager:      'Manager',
  receptionist: 'Receptionist',
  housekeeping: 'Housekeeping',
  security:     'Security',
  kitchen:      'Kitchen',
}

export const ADMIN_ROLES: Role[] = ['admin', 'manager', 'receptionist']
export const STAFF_ROLES: Role[] = ['housekeeping', 'security', 'kitchen']
