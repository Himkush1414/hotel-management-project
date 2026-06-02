// ─── Actions ────────────────────────────────────────────────────────────────

export const ACTIONS = {
  // Staff
  VIEW_STAFF: "VIEW_STAFF",
  EDIT_STAFF: "EDIT_STAFF",
  DELETE_STAFF: "DELETE_STAFF",
  VIEW_SALARY: "VIEW_SALARY",

  // Attendance
  VIEW_ATTENDANCE: "VIEW_ATTENDANCE",
  MARK_ATTENDANCE: "MARK_ATTENDANCE",
  EXPORT_ATTENDANCE: "EXPORT_ATTENDANCE",

  // Rooms
  VIEW_ROOMS: "VIEW_ROOMS",
  EDIT_ROOMS: "EDIT_ROOMS",
  UPDATE_ROOM_STATUS: "UPDATE_ROOM_STATUS",

  // Guests
  VIEW_GUESTS: "VIEW_GUESTS",
  EDIT_GUESTS: "EDIT_GUESTS",

  // Bookings
  VIEW_BOOKINGS: "VIEW_BOOKINGS",
  CREATE_BOOKING: "CREATE_BOOKING",
  CANCEL_BOOKING: "CANCEL_BOOKING",

  // Invoices / Billing
  VIEW_INVOICES: "VIEW_INVOICES",
  CREATE_INVOICE: "CREATE_INVOICE",
  APPLY_DISCOUNT: "APPLY_DISCOUNT",
  ISSUE_REFUND: "ISSUE_REFUND",

  // Expenses
  VIEW_EXPENSES: "VIEW_EXPENSES",
  EDIT_EXPENSES: "EDIT_EXPENSES",
  DELETE_EXPENSES: "DELETE_EXPENSES",

  // Analytics
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  EXPORT_REPORTS: "EXPORT_REPORTS",

  // Settings
  VIEW_SETTINGS: "VIEW_SETTINGS",
  EDIT_SETTINGS: "EDIT_SETTINGS",
  TOGGLE_FEATURE_FLAGS: "TOGGLE_FEATURE_FLAGS",

  // Audit
  VIEW_AUDIT_LOG: "VIEW_AUDIT_LOG",

  // Friendly aliases used in components
  manage_staff:    "EDIT_STAFF",
  manage_rooms:    "EDIT_ROOMS",
  manage_guests:   "EDIT_GUESTS",
  manage_bookings: "CREATE_BOOKING",
  admin:           "TOGGLE_FEATURE_FLAGS",
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// ─── Roles ───────────────────────────────────────────────────────────────────

export type Role = "admin" | "manager" | "receptionist" | "housekeeping" | "security" | "kitchen";

// ─── Role Permissions Map ─────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  admin: [
    ACTIONS.VIEW_STAFF,
    ACTIONS.EDIT_STAFF,
    ACTIONS.DELETE_STAFF,
    ACTIONS.VIEW_SALARY,

    ACTIONS.VIEW_ATTENDANCE,
    ACTIONS.MARK_ATTENDANCE,
    ACTIONS.EXPORT_ATTENDANCE,

    ACTIONS.VIEW_ROOMS,
    ACTIONS.EDIT_ROOMS,
    ACTIONS.UPDATE_ROOM_STATUS,

    ACTIONS.VIEW_GUESTS,
    ACTIONS.EDIT_GUESTS,

    ACTIONS.VIEW_BOOKINGS,
    ACTIONS.CREATE_BOOKING,
    ACTIONS.CANCEL_BOOKING,

    ACTIONS.VIEW_INVOICES,
    ACTIONS.CREATE_INVOICE,
    ACTIONS.APPLY_DISCOUNT,
    ACTIONS.ISSUE_REFUND,

    ACTIONS.VIEW_EXPENSES,
    ACTIONS.EDIT_EXPENSES,
    ACTIONS.DELETE_EXPENSES,

    ACTIONS.VIEW_ANALYTICS,
    ACTIONS.EXPORT_REPORTS,

    ACTIONS.VIEW_SETTINGS,
    ACTIONS.EDIT_SETTINGS,
    ACTIONS.TOGGLE_FEATURE_FLAGS,

    ACTIONS.VIEW_AUDIT_LOG,
  ],

  manager: [
    ACTIONS.VIEW_STAFF,
    ACTIONS.EDIT_STAFF,
    ACTIONS.VIEW_SALARY,

    ACTIONS.VIEW_ATTENDANCE,
    ACTIONS.MARK_ATTENDANCE,
    ACTIONS.EXPORT_ATTENDANCE,

    ACTIONS.VIEW_ROOMS,
    ACTIONS.EDIT_ROOMS,
    ACTIONS.UPDATE_ROOM_STATUS,

    ACTIONS.VIEW_GUESTS,
    ACTIONS.EDIT_GUESTS,

    ACTIONS.VIEW_BOOKINGS,
    ACTIONS.CREATE_BOOKING,
    ACTIONS.CANCEL_BOOKING,

    ACTIONS.VIEW_INVOICES,
    ACTIONS.CREATE_INVOICE,
    ACTIONS.APPLY_DISCOUNT,
    ACTIONS.ISSUE_REFUND,

    ACTIONS.VIEW_EXPENSES,
    ACTIONS.EDIT_EXPENSES,

    ACTIONS.VIEW_ANALYTICS,
    ACTIONS.EXPORT_REPORTS,

    ACTIONS.VIEW_SETTINGS,
  ],

  receptionist: [
    ACTIONS.VIEW_ROOMS,
    ACTIONS.UPDATE_ROOM_STATUS,

    ACTIONS.VIEW_GUESTS,
    ACTIONS.EDIT_GUESTS,

    ACTIONS.VIEW_BOOKINGS,
    ACTIONS.CREATE_BOOKING,
    ACTIONS.CANCEL_BOOKING,

    ACTIONS.VIEW_INVOICES,
    ACTIONS.CREATE_INVOICE,
  ],

  housekeeping: [
    ACTIONS.VIEW_ROOMS,
    ACTIONS.UPDATE_ROOM_STATUS,

    ACTIONS.VIEW_ATTENDANCE,
    ACTIONS.MARK_ATTENDANCE,
  ],

  security: [
    ACTIONS.VIEW_GUESTS,

    ACTIONS.VIEW_BOOKINGS,

    ACTIONS.VIEW_ATTENDANCE,
    ACTIONS.MARK_ATTENDANCE,
  ],

  kitchen: [
    ACTIONS.VIEW_ATTENDANCE,
    ACTIONS.MARK_ATTENDANCE,
  ],
};

// ─── Permission Helpers ───────────────────────────────────────────────────────

/**
 * Returns true if the given role has the specified action permission.
 */
export function hasPermission(role: Role, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(action);
}

/**
 * Returns true if the given role has at least one of the specified actions.
 */
export function hasAnyPermission(role: Role, actions: Action[]): boolean {
  return actions.some((action) => hasPermission(role, action));
}
