"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/formatDate";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { BookingWithDetails } from "@/types/booking";
import { cn } from "@/lib/utils/cn";

interface RecentBookingsProps {
  bookings: BookingWithDetails[];
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  checked_in: "bg-emerald-100 text-emerald-700 border-emerald-200",
  checked_out: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  no_show: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Recent Check-ins
        </CardTitle>
        <Link href="/bookings" className={buttonVariants({ variant: "ghost", size: "sm" }) + " flex items-center gap-1 text-sm"}>
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent bookings found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-2 pr-4">Guest</th>
                  <th className="pb-2 pr-4">Room</th>
                  <th className="pb-2 pr-4">Check-in</th>
                  <th className="pb-2 pr-4">Check-out</th>
                  <th className="pb-2 pr-4">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="py-3 pr-4 font-medium">
                      {booking.guest?.full_name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {booking.room?.room_number ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDate(booking.check_in_date)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDate(booking.check_out_date)}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {booking.invoice
                        ? formatCurrency(booking.invoice.total_amount)
                        : "—"}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-normal",
                          STATUS_STYLES[booking.status]
                        )}
                      >
                        {STATUS_LABELS[booking.status] ?? booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
