import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AttendanceSummary } from "@/components/staff/AttendanceSummary";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function MyAttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (!staff) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("staff_id", staff.id)
    .gte("date", startOfMonth)
    .order("date", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <PageHeader title="My Attendance" subtitle="Your attendance record this month" />
      <AttendanceSummary attendance={(attendance ?? []) as any} staff={staff} />
    </div>
  );
}
