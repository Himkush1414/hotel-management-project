import { createClient } from '@/lib/supabase/server'
import { GuestTable } from '@/components/guests/GuestTable'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Guest } from '@/types/guest'

interface SearchParams {
  q?: string
  page?: string
}

const PAGE_SIZE = 20

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q = '', page = '1' } = await searchParams
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!
  const pageNum = Math.max(1, Number(page))
  const from = (pageNum - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('guests')
    .select('*', { count: 'exact' })
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q.trim()) {
    query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: guests, count } = await query

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guests"
        subtitle={`${count ?? 0} total guests registered`}
      />
      <GuestTable
        guests={(guests ?? []) as Guest[]}
        total={count ?? 0}
        page={pageNum}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        searchQuery={q}
      />
    </div>
  )
}
