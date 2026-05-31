import type { Database } from "./database";
import type { BookingWithDetails } from "./booking";
import type { Guest } from "./guest";

export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category: string;
}

export interface InvoiceWithDetails extends Invoice {
  booking: BookingWithDetails;
  guest: Guest;
  payments: Payment[];
  line_items: InvoiceLineItem[];
  amount_paid: number;
  balance_due: number;
}
