import type { Database } from "./database";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export interface NotificationWithMeta extends Notification {
  time_ago: string;
  is_actionable: boolean;
}
