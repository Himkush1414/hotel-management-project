export const ROOM_STATUS = {
  AVAILABLE:   'available',
  OCCUPIED:    'occupied',
  CLEANING:    'cleaning',
  MAINTENANCE: 'maintenance',
  BLOCKED:     'blocked',
} as const

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS]

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available:   'Available',
  occupied:    'Occupied',
  cleaning:    'Cleaning',
  maintenance: 'Maintenance',
  blocked:     'Blocked',
}

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available:   'bg-green-100 text-green-800',
  occupied:    'bg-red-100 text-red-800',
  cleaning:    'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-orange-100 text-orange-800',
  blocked:     'bg-gray-100 text-gray-800',
}
