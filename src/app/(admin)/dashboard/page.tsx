import { createServerClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentBookings } from "@/components/dashboard/RecentBookings";
import { RoomStatusGrid } from "@/components/dashboard/RoomStatusGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BedDouble, TrendingUp, LogIn, LogOut } from "lucide-react";
import type { BookingWithDetails } from "@/types/booking";

async function getDashboardData() {
  const supabase = await createServerClient();
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const [
    todayPayments,
    yesterdayPayments,
    rooms,
    todayCheckins,
    yesterdayCheckins,
    todayCheckouts,
    yesterdayCheckouts,
    recentBookings,
    occupancyData,
    revenueData,
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount")
      .eq("hotel_id", hotelId)
      .gte("paid_at", `${today}T00:00:00`)
      .lte("paid_at", `${today}T23:59:59`),
    supabase
      .from("payments")
      .select("amount")
      .eq("hotel_id", hotelId)
      .gte("paid_at", `${yesterday}T00:00:00`)
      .lte("paid_at", `${yesterday}T23:59:59`),
    supabase
      .from("rooms")
      .select("status")
      .eq("hotel_id", hotelId),
    supabase
      .from("bookings")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("check_in_date", today),
    supabase
      .from("bookings")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("check_in_date", yesterday),
    supabase
      .from("bookings")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("check_out_date", today),
    supabase
      .from("bookings")
      .select("id")
      .eq("hotel_id", hotelId)
      .eq("check_out_date", yesterday),
    supabase
      .from("bookings")
      .select(
        `
        id, booking_reference, check_in_date, check_out_date, status, room_rate,
        guest:guests(id, full_name, phone),
        room:rooms(id, room_number, floor, room_type_id, status, notes, hotel_id, created_at, updated_at,
          room_type:room_types(id, hotel_id, name, description, base_price, max_adults, max_children, amenities, created_at, updated_at)
        ),
        invoice:invoices(id, invoice_number, total_amount, payment_status)
      `
      )
      .eq("hotel_id", hotelId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("bookings")
      .select("check_in_date, check_out_date, status")
      .eq("hotel_id", hotelId)
      .gte("check_in_date", thirtyDaysAgo),
    supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("hotel_id", hotelId)
      .gte("paid_at", new Date(Date.now() - 7 * 86400000).toISOString()),
  ]);

  const todayRevenue =
    todayPayments.data?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const yesterdayRevenue =
    yesterdayPayments.data?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

  const totalRooms = rooms.data?.length ?? 0;
  const occupiedRooms =
    rooms.data?.filter((r) => r.status === "occupied").length ?? 0;
  const availableRooms =
    rooms.data?.filter((r) => r.status === "available").length ?? 0;
  const cleaningRooms =
    rooms.data?.filter((r) => r.status === "cleaning").length ?? 0;
  const maintenanceRooms =
    rooms.data?.filter((r) => r.status === "maintenance").length ?? 0;

  const revenueByDay: Record<string, number> = {};
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    last7Days.push(d);
    revenueByDay[d] = 0;
  }
  revenueData.data?.forEach((p) => {
    const day = p.paid_at.split("T")[0];
    if (revenueByDay[day] !== undefined) {
      revenueByDay[day] += p.amount;
    }
  });

  const occupancyByDay: Record<string, { occupied: number; total: number }> =
    {};
  const last30Days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    last30Days.push(d);
    occupancyByDay[d] = { occupied: 0, total: totalRooms };
  }
  occupancyData.data?.forEach((b) => {
    last30Days.forEach((day) => {
      if (b.check_in_date <= day && b.check_out_date > day) {
        if (occupancyByDay[day]) occupancyByDay[day].occupied++;
      }
    });
  });

  return {
    todayRevenue,
    yesterdayRevenue,
    occupiedRooms,
    availableRooms,
    cleaningRooms,
    maintenanceRooms,
    totalRooms,
    todayCheckins: todayCheckins.data?.length ?? 0,
    yesterdayCheckins: yesterdayCheckins.data?.length ?? 0,
    todayCheckouts: todayCheckouts.data?.length ?? 0,
    yesterdayCheckouts: yesterdayCheckouts.data?.length ?? 0,
    recentBookings: (recentBookings.data ?? []) as unknown as BookingWithDetails[],
    revenueChartData: last7Days.map((day) => ({
      date: day,
      revenue: revenueByDay[day] ?? 0,
    })),
    occupancyChartData: last30Days.map((day) => ({
      date: day,
      occupancy:
        totalRooms > 0
          ? Math.round(
              ((occupancyByDay[day]?.occupied ?? 0) / totalRooms) * 100
            )
          : 0,
    })),
  };
}

function calcChange(today: number, yesterday: number): number {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const stats = [
    {
      title: "Today's Revenue",
      value: data.todayRevenue,
      icon: TrendingUp,
      change: calcChange(data.todayRevenue, data.yesterdayRevenue),
      format: "currency" as const,
    },
    {
      title: "Occupied Rooms",
      value: data.occupiedRooms,
      icon: BedDouble,
      change: 0,
      format: "number" as const,
      subtitle: `of ${data.totalRooms} total`,
    },
    {
      title: "Check-ins Today",
      value: data.todayCheckins,
      icon: LogIn,
      change: calcChange(data.todayCheckins, data.yesterdayCheckins),
      format: "number" as const,
    },
    {
      title: "Check-outs Today",
      value: data.todayCheckouts,
      icon: LogOut,
      change: calcChange(data.todayCheckouts, data.yesterdayCheckouts),
      format: "number" as const,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            format={stat.format}
            subtitle={"subtitle" in stat ? stat.subtitle : undefined}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <OccupancyChart data={data.occupancyChartData} />
        </div>
        <div>
          <RevenueChart data={data.revenueChartData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentBookings bookings={data.recentBookings} />
        </div>
        <div className="space-y-4">
          <RoomStatusGrid
            available={data.availableRooms}
            occupied={data.occupiedRooms}
            cleaning={data.cleaningRooms}
            maintenance={data.maintenanceRooms}
          />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
