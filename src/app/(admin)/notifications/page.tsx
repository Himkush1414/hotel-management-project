import { createClient } from "@/lib/supabase/server";
import { NotificationList } from "@/components/notifications/NotificationList";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("hotel_id", process.env.NEXT_PUBLIC_HOTEL_ID!)
    .or(`user_id.eq.${user?.id},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with hotel activity"
      />
      <NotificationList initialNotifications={notifications ?? []} />
    </div>
  );
}
