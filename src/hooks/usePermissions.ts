import { useAuth } from '@/contexts/AuthContext'
import {
  hasPermission,
  hasAnyPermission,
  type Action,
} from '@/config/permissions'
import type { Role } from '@/constants/roles'

export function usePermissions() {
  const { profile } = useAuth()
  const role = (profile?.role ?? 'receptionist') as Role

  return {
    can:    (permission: Action) => hasPermission(role, permission),
    canAny: (permissions: Action[]) => hasAnyPermission(role, permissions),
    role,
  }
}
