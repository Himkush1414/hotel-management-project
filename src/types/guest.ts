import type { Database } from "./database";
import type { Booking } from "./booking";

export type Guest = Database["public"]["Tables"]["guests"]["Row"];

export interface GuestWithBookings extends Guest {
  bookings: Booking[];
  total_stays: number;
  total_spent: number;
}

export interface GuestStayHistory {
  guest_id: string;
  booking_reference: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  amount_paid: number;
  status: Database["public"]["Tables"]["bookings"]["Row"]["status"];
}
