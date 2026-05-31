import type { Database, BookingStatus } from "./database";
import type { Guest } from "./guest";
import type { RoomWithType } from "./room";

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingExtra = Database["public"]["Tables"]["booking_extras"]["Row"];

export interface BookingWithDetails extends Booking {
  guest: Guest;
  room: RoomWithType;
  extras: BookingExtra[];
  invoice: {
    id: string;
    invoice_number: string;
    total_amount: number;
    payment_status: Database["public"]["Tables"]["invoices"]["Row"]["payment_status"];
  } | null;
}

export interface CheckInData {
  booking_id: string;
  actual_check_in: string;
  status: Extract<BookingStatus, "checked_in">;
}

export interface CheckOutData {
  booking_id: string;
  actual_check_out: string;
  status: Extract<BookingStatus, "checked_out">;
}
