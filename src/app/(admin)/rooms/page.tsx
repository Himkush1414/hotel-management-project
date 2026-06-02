import { createClient } from "@/lib/supabase/server"
import { RoomsClient } from "./RoomsClient"

export default async function RoomsPage() {
  const supabase = await createClient()
  const hotelId  = process.env.NEXT_PUBLIC_HOTEL_ID!

  const [{ data: rooms }, { data: roomTypes }] = await Promise.all([
    supabase
      .from("rooms")
      .select("*, room_type_id:room_type_ids(id, name, base_price, max_occupancy)")
      .eq("hotel_id", hotelId)
      .order("room_number"),
    supabase
      .from("room_type_ids")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("name"),
  ])

  return <RoomsClient rooms={rooms || []} roomTypes={roomTypes || []} hotelId={hotelId} />
}
