import { type Action, hasPermission, hasAnyPermission, type Role } from "./permissions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavigationItem {
  label: string;
  href: string;
  iconName: string;
  requiredPermission?: Action;
  requiredAnyPermission?: Action[];
  featureFlag?: string;
}

export type FeatureFlags = Record<string, boolean>;

// ─── Admin Navigation ─────────────────────────────────────────────────────────

export const ADMIN_NAVIGATION: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    label: "Rooms",
    href: "/admin/rooms",
    iconName: "BedDouble",
    requiredPermission: "VIEW_ROOMS",
  },
  {
    label: "Guests",
    href: "/admin/guests",
    iconName: "Users",
    requiredPermission: "VIEW_GUESTS",
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    iconName: "CalendarCheck",
    requiredPermission: "VIEW_BOOKINGS",
  },
  {
    label: "Billing",
    href: "/admin/billing",
    iconName: "Receipt",
    requiredPermission: "VIEW_INVOICES",
  },
  {
    label: "Staff",
    href: "/admin/staff",
    iconName: "UserCog",
    requiredPermission: "VIEW_STAFF",
  },
  {
    label: "Attendance",
    href: "/admin/attendance",
    iconName: "ClipboardList",
    requiredPermission: "VIEW_ATTENDANCE",
  },
  {
    label: "Expenses",
    href: "/admin/expenses",
    iconName: "Wallet",
    requiredPermission: "VIEW_EXPENSES",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    iconName: "BarChart3",
    requiredPermission: "VIEW_ANALYTICS",
    featureFlag: "analytics",
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    iconName: "Bell",
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    iconName: "ScrollText",
    requiredPermission: "VIEW_AUDIT_LOG",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    iconName: "Settings",
    requiredPermission: "VIEW_SETTINGS",
  },
];

// ─── Staff Portal Navigation ──────────────────────────────────────────────────

export const STAFF_PORTAL_NAVIGATION: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/staff/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    label: "My Attendance",
    href: "/staff/attendance",
    iconName: "ClipboardList",
    requiredPermission: "VIEW_ATTENDANCE",
  },
  {
    label: "Rooms",
    href: "/staff/rooms",
    iconName: "BedDouble",
    requiredPermission: "VIEW_ROOMS",
  },
  {
    label: "Bookings",
    href: "/staff/bookings",
    iconName: "CalendarCheck",
    requiredPermission: "VIEW_BOOKINGS",
  },
  {
    label: "Guests",
    href: "/staff/guests",
    iconName: "Users",
    requiredPermission: "VIEW_GUESTS",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Filters navigation items based on the user's role and active feature flags.
 * Items with no requiredPermission are always shown.
 * Items with a featureFlag are hidden if the flag is disabled.
 */
export function getNavigationForRole(role: Role, flags: FeatureFlags, portal: "admin" | "staff" = "admin"): NavigationItem[] {
  const source = portal === "staff" ? STAFF_PORTAL_NAVIGATION : ADMIN_NAVIGATION;

  return source.filter((item) => {
    // Feature flag gate
    if (item.featureFlag && !flags[item.featureFlag]) {
      return false;
    }

    // Permission gate — requiredPermission (single)
    if (item.requiredPermission) {
      return hasPermission(role, item.requiredPermission);
    }

    // Permission gate — requiredAnyPermission (any of)
    if (item.requiredAnyPermission && item.requiredAnyPermission.length > 0) {
      return hasAnyPermission(role, item.requiredAnyPermission);
    }

    // No permission required — always visible
    return true;
  });
}
