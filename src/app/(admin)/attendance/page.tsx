import { createClient } from "@/lib/supabase/server";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AttendancePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*, staff(id, full_name, role)")
    .eq("date", today)
    .order("created_at", { ascending: false });

  const { data: allStaff } = await supabase
    .from("staff")
    .select("id, full_name, role")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .eq("is_active", true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Track staff attendance and working hours"
      />
      <AttendanceStats
        attendance={attendance ?? []}
        totalStaff={allStaff?.length ?? 0}
      />
      <AttendanceTable
        initialAttendance={attendance ?? []}
        allStaff={allStaff ?? []}
      />
    </div>
  );
}
