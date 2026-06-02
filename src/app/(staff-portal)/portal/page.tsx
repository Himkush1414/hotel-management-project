import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, ClipboardList, User, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function StaffPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (!staff) redirect("/login");

  const today = new Date().toISOString().split("T")[0];
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", staff.id)
    .eq("date", today)
    .single();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickLinks = [
    { href: "/portal/my-attendance", icon: Calendar, label: "My Attendance", color: "bg-blue-50 text-blue-600" },
    { href: "/portal/my-tasks", icon: ClipboardList, label: "My Tasks", color: "bg-green-50 text-green-600" },
    { href: "/portal/my-profile", icon: User, label: "My Profile", color: "bg-purple-50 text-purple-600" },
  ];

  const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    present: { icon: CheckCircle, color: "text-green-600", label: "Present" },
    absent: { icon: XCircle, color: "text-red-600", label: "Absent" },
    late: { icon: Clock, color: "text-yellow-600", label: "Late" },
    half_day: { icon: Clock, color: "text-blue-600", label: "Half Day" },
  };

  const status = todayAttendance ? STATUS_CONFIG[todayAttendance.status] : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">
          {greeting}, {staff.full_name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1 capitalize">
          {staff.role} · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAttendance && status ? (
            <div className="flex items-center gap-3">
              <status.icon className={`h-6 w-6 ${status.color}`} />
              <div>
                <p className="font-medium">{status.label}</p>
                <p className="text-sm text-muted-foreground">
                  {todayAttendance.check_in && `In: ${todayAttendance.check_in}`}
                  {todayAttendance.check_out && ` · Out: ${todayAttendance.check_out}`}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No attendance recorded for today yet.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className={`p-3 rounded-full ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
