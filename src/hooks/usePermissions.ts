import { useAuth } from '@/contexts/AuthContext'
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
} from '@/config/permissions'
import type { Role } from '@/constants/roles'

export function usePermissions() {
  const { profile } = useAuth()
  const role = (profile?.role ?? 'receptionist') as Role

  return {
    can:    (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    role,
  }
}
