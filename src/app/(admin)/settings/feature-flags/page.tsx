import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeatureFlagsPanel } from "@/components/settings/FeatureFlagsPanel";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function FeatureFlagsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staffProfile } = await supabase
    .from("staff")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (staffProfile?.role !== "admin") redirect("/dashboard");

  const { data: flags } = await supabase
    .from("feature_flags")
    .select("*")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .order("flag_name");

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Feature Flags"
        subtitle="Enable or disable features for your hotel"
      />
      <FeatureFlagsPanel initialFlags={flags ?? []} />
    </div>
  );
}
