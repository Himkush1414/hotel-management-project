import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const hotelId = process.env.NEXT_PUBLIC_HOTEL_ID!;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_amount, created_at, payment_status")
    .eq("hotel_id", hotelId)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .eq("payment_status", "paid")
    .order("created_at", { ascending: true });

  const { data: bookings } = await supabase
    .from("bookings")
    .select("check_in_date, check_out_date, status")
    .eq("hotel_id", hotelId)
    .gte("check_in_date", thirtyDaysAgo.toISOString().split("T")[0]);

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id")
    .eq("hotel_id", hotelId);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, expense_date")
    .eq("hotel_id", hotelId)
    .gte("expense_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("expense_date", { ascending: true });

  const totalRooms = rooms?.length ?? 0;
  const totalRevenue = (invoices ?? []).reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalExpenses = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);

  const occupancyData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const occupiedRooms = (bookings ?? []).filter((b) => {
      return b.check_in_date <= dateStr && b.check_out_date > dateStr && b.status !== "cancelled";
    }).length;
    return {
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      occupancy: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    };
  });

  const revenueByDay = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const rev = (invoices ?? [])
      .filter((inv) => inv.created_at.startsWith(dateStr))
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    const exp = (expenses ?? [])
      .filter((e) => e.expense_date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      revenue: rev,
      expenses: exp,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Hotel performance metrics for the last 30 days"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                totalRevenue - totalExpenses >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {formatCurrency(Math.abs(totalRevenue - totalExpenses))}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <OccupancyChart data={occupancyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueByDay} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
