import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!
  const today = new Date().toISOString().split("T")[0]

  const [
    { data: todayBookings },
    { data: rooms },
    { data: recentCheckins },
    { data: invoicesToday },
    { data: notifications },
  ] = await Promise.all([
    supabase.from("bookings").select("id,status,check_in_date,check_out_date")
      .eq("hotel_id", hotelId)
      .or(`check_in_date.eq.${today},check_out_date.eq.${today}`),
    supabase.from("rooms").select("id,room_number,status,room_type_id:room_type_ids(name,base_price)")
      .eq("hotel_id", hotelId),
    supabase.from("bookings").select(`
        id,booking_number,status,check_in_date,check_out_date,
        guest:guests(full_name,phone),
        room:rooms(room_number)
      `).eq("hotel_id", hotelId)
      .in("status", ["checked_in","confirmed"])
      .order("created_at", { ascending: false }).limit(8),
    supabase.from("invoices").select("id,total_amount,payment_status")
      .eq("hotel_id", hotelId)
      .gte("created_at", today + "T00:00:00")
      .lte("created_at", today + "T23:59:59"),
    supabase.from("notifications").select("id,is_read")
      .eq("hotel_id", hotelId).eq("is_read", false),
  ])

  const todayRevenue = (invoicesToday || [])
    .filter((i: any) => i.payment_status === "paid")
    .reduce((s: number, i: any) => s + (i.total_amount || 0), 0)

  const occupiedCount  = (rooms || []).filter((r: any) => r.status === "occupied").length
  const totalRooms     = (rooms || []).length
  const checkinsToday  = (todayBookings || []).filter((b: any) => b.check_in_date === today).length
  const checkoutsToday = (todayBookings || []).filter((b: any) => b.check_out_date === today).length
  const unreadNotifs   = (notifications || []).length
  const occupancyRate  = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0

  return (
    <DashboardClient
      stats={{ todayRevenue, occupiedCount, totalRooms, checkinsToday, checkoutsToday, occupancyRate, unreadNotifs }}
      rooms={rooms || []}
      recentCheckins={recentCheckins || []}
    />
  )
}
