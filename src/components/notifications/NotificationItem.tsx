"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  UserCheck,
  UserX,
  CreditCard,
  BedDouble,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

interface Props {
  notification: Notification;
  onRead: (id: string) => void;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  check_in: UserCheck,
  check_out: UserX,
  payment: CreditCard,
  room: BedDouble,
  alert: AlertCircle,
  info: Info,
};

const TYPE_COLORS: Record<string, string> = {
  check_in: "bg-green-100 text-green-600",
  check_out: "bg-blue-100 text-blue-600",
  payment: "bg-purple-100 text-purple-600",
  room: "bg-yellow-100 text-yellow-600",
  alert: "bg-red-100 text-red-600",
  info: "bg-gray-100 text-gray-600",
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationItem({ notification, onRead }: Props) {
  const router = useRouter();
  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  const colorClass = TYPE_COLORS[notification.type] ?? "bg-gray-100 text-gray-600";

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors",
        notification.is_read
          ? "bg-background hover:bg-muted/30"
          : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      )}
    >
      <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", !notification.is_read && "font-semibold")}>
            {notification.title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {timeAgo(notification.created_at)}
            </span>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
      </div>
    </div>
  );
}
