"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./NotificationItem";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  hotel_id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

interface Props {
  initialNotifications: Notification[];
}

export function NotificationList({ initialNotifications }: Props) {
  const supabase = createClient();
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useSupabaseRealtime<any>({
    table: "notifications",
    filter: `hotel_id=eq.${process.env.NEXT_PUBLIC_HOTEL_ID}`,
    onInsert: (row: any) => {
      setNotifications((prev) => [row, ...prev]);
    },
  });

  const unread = notifications.filter((n) => !n.is_read);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const ids = unread.map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unread.length > 0 && `(${unread.length})`}
          </TabsTrigger>
        </TabsList>
        {unread.length > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>
      <TabsContent value="all">
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
            ))
          )}
        </div>
      </TabsContent>
      <TabsContent value="unread">
        <div className="space-y-2">
          {unread.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              No unread notifications.
            </p>
          ) : (
            unread.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
