import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Hotel } from "@/types/settings";
import { HotelForm } from "@/components/settings/HotelForm";
import { DangerZone } from "@/components/settings/DangerZone";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staffProfile } = await supabase
    .from("staff")
    .select("role")
    .eq("profile_id", user.id)
    .single();

  if (staffProfile?.role !== "admin") redirect("/dashboard");

  const { data: hotel } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .single();

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your hotel configuration"
      />
      <HotelForm hotel={hotel as any} />
      <DangerZone />
    </div>
  );
}
