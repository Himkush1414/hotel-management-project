import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

if (typeof window !== 'undefined') {
  throw new Error(
    'supabase/admin.ts must only be imported in server-side code. ' +
    'Never import it in Client Components.'
  )
}

export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
