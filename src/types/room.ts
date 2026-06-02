import type { Database } from "./database";

export type { RoomStatus } from "./database";

export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type RoomType = Database["public"]["Tables"]["room_type_ids"]["Row"];

export type RoomWithType = Omit<Room, "room_type_id"> & {
  room_type_id: RoomType | string;
};

export interface RoomStatusUpdate {
  room_id: string;
  status: import("./database").RoomStatus;
  notes?: string;
}
