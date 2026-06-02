import { createClient } from "@/lib/supabase/server"
import { GuestsClient } from "./GuestsClient"

export default async function GuestsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const { data: guests } = await supabase
    .from("guests")
    .select("*, bookings(id, status, check_in_date, check_out_date, booking_number)")
    .eq("hotel_id", hotelId)
    .order("created_at", { ascending: false })

  return <GuestsClient guests={guests || []} hotelId={hotelId} />
}
