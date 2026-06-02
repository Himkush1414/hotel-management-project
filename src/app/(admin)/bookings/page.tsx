import { createClient } from "@/lib/supabase/server"
import { BookingsClient } from "./BookingsClient"

export default async function BookingsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [{ data: bookings }, { data: guests }, { data: rooms }] = await Promise.all([
    supabase.from("bookings")
      .select(`*, guest:guests(id,full_name,phone,email), room:rooms(id,room_number,room_type_id:room_type_ids(name,base_price))`)
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("guests").select("id,full_name,phone").eq("hotel_id", hotelId).order("full_name"),
    supabase.from("rooms").select("id,room_number,status,room_type_id:room_type_ids(id,name,base_price)").eq("hotel_id", hotelId).order("room_number"),
  ])

  return <BookingsClient bookings={bookings||[]} guests={guests||[]} rooms={rooms||[]} hotelId={hotelId}/>
}
