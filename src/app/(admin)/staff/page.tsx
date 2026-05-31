import { createClient } from "@/lib/supabase/server";
import { StaffTable } from "@/components/staff/StaffTable";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function StaffPage() {
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff")
    .select("*")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subtitle="Manage your hotel staff members"
      />
      <StaffTable initialStaff={staff ?? []} />
    </div>
  );
}
