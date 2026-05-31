import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/constants/roles'

export function useCurrentUser() {
  const { user, profile, isLoading } = useAuth()

  function hasRole(role: Role): boolean {
    return profile?.role === role
  }

  function hasAnyRole(roles: Role[]): boolean {
    return !!profile?.role && roles.includes(profile.role as Role)
  }

  const isAdmin       = () => hasRole('admin')
  const isManager     = () => hasRole('manager')
  const isReceptionist= () => hasRole('receptionist')
  const isHousekeeping= () => hasRole('housekeeping')
  const isSecurity    = () => hasRole('security')
  const isKitchen     = () => hasRole('kitchen')

  const isAdminOrManager = () => hasAnyRole(['admin', 'manager'])
  const isOperationsStaff = () =>
    hasAnyRole(['admin', 'manager', 'receptionist'])

  return {
    user,
    profile,
    isLoading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager,
    isReceptionist,
    isHousekeeping,
    isSecurity,
    isKitchen,
    isAdminOrManager,
    isOperationsStaff,
  }
}
