import type { Database, RoomStatus } from "./database";

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomType = Database["public"]["Tables"]["room_types"]["Row"];

export interface RoomWithType extends Room {
  room_type: RoomType;
}

export interface RoomStatusUpdate {
  room_id: string;
  status: RoomStatus;
  notes?: string;
}
