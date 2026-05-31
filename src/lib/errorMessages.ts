const SUPABASE_ERROR_MAP: Record<string, string> = {
  'invalid_credentials':        'Invalid email or password. Please try again.',
  'email_not_confirmed':        'Please verify your email address before logging in.',
  'user_not_found':             'No account found with this email.',
  'user_already_exists':        'An account with this email already exists.',
  'email_address_invalid':      'Please enter a valid email address.',
  'password_too_short':         'Password must be at least 8 characters.',
  'over_email_send_rate_limit': 'Too many requests. Please wait a few minutes and try again.',
  'otp_expired':                'The link has expired. Please request a new one.',
  'same_password':              'Your new password must be different from your current password.',
  '23505':                      'This record already exists.',
  '23503':                      'Cannot complete this action — a related record is required.',
  '23502':                      'A required field is missing.',
  '42501':                      'You do not have permission to perform this action.',
  'PGRST116':                   'Record not found.',
  'PGRST301':                   'Your session has expired. Please log in again.',
  'StorageApiError':            'File upload failed. Please check the file size and try again.',
  'Bucket not found':           'Storage configuration error. Please contact support.',
  'Failed to fetch':            'Network error. Please check your connection and try again.',
}

export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.'

  if (typeof error === 'string') {
    return SUPABASE_ERROR_MAP[error] ?? error
  }

  if (error instanceof Error) {
    for (const [key, message] of Object.entries(SUPABASE_ERROR_MAP)) {
      if (error.message.includes(key)) return message
    }
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    if (typeof err['code'] === 'string') {
      const mapped = SUPABASE_ERROR_MAP[err['code']]
      if (mapped) return mapped
    }
    if (typeof err['message'] === 'string') {
      for (const [key, message] of Object.entries(SUPABASE_ERROR_MAP)) {
        if ((err['message'] as string).includes(key)) return message
      }
      return err['message'] as string
    }
  }

  return 'An unexpected error occurred. Please try again.'
}
