export const PAYMENT_STATUS = {
  PENDING:  'pending',
  PARTIAL:  'partial',
  PAID:     'paid',
  REFUNDED: 'refunded',
  FAILED:   'failed',
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending:  'Pending',
  partial:  'Partially Paid',
  paid:     'Paid',
  refunded: 'Refunded',
  failed:   'Failed',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  partial:  'bg-blue-100 text-blue-800',
  paid:     'bg-green-100 text-green-800',
  refunded: 'bg-purple-100 text-purple-800',
  failed:   'bg-red-100 text-red-800',
}

export const PAYMENT_MODES = [
  { value: 'cash',          label: 'Cash' },
  { value: 'card',          label: 'Card' },
  { value: 'upi',           label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'razorpay',      label: 'Razorpay' },
  { value: 'complimentary', label: 'Complimentary' },
] as const
