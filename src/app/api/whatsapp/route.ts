import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type TemplateType = "check_in_confirmation" | "bill_summary" | "checkout_reminder";

interface WhatsAppRequestBody {
  booking_id?: string;
  invoice_id?: string;
  template_type: TemplateType;
}

interface WhatsAppPayload {
  phone_number: string;
  message: string;
  template_type: TemplateType;
}

function buildCheckInMessage(guestName: string, roomNumber: string, checkInDate: string, checkOutDate: string): string {
  return (
    `Hello ${guestName}! 🏨\n\n` +
    `Your check-in at our hotel has been confirmed.\n\n` +
    `📋 Booking Details:\n` +
    `Room: ${roomNumber}\n` +
    `Check-in: ${checkInDate}\n` +
    `Check-out: ${checkOutDate}\n\n` +
    `We hope you enjoy your stay! Please reach out if you need anything.`
  );
}

function buildBillSummaryMessage(guestName: string, invoiceNumber: string, totalAmount: string, roomNumber: string): string {
  return (
    `Hello ${guestName}! 🧾\n\n` +
    `Your bill summary is ready.\n\n` +
    `📋 Invoice Details:\n` +
    `Invoice #: ${invoiceNumber}\n` +
    `Room: ${roomNumber}\n` +
    `Total Amount: ₹${totalAmount}\n\n` +
    `Thank you for staying with us! Please contact reception for any billing queries.`
  );
}

function buildCheckoutReminderMessage(guestName: string, roomNumber: string, checkOutDate: string): string {
  return (
    `Hello ${guestName}! ⏰\n\n` +
    `This is a friendly reminder that your check-out is scheduled for today, ${checkOutDate}.\n\n` +
    `Room: ${roomNumber}\n\n` +
    `Please visit the reception desk to complete your check-out. We hope you had a wonderful stay! 🌟`
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the requesting user
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check role — only admin or manager can send WhatsApp messages
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (staffError || !staffData) {
      return NextResponse.json({ success: false, error: "Staff record not found" }, { status: 403 });
    }

    const allowedRoles = ["admin", "manager"];
    if (!allowedRoles.includes(staffData.role)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 });
    }

    const body: WhatsAppRequestBody = await request.json();
    const { booking_id, invoice_id, template_type } = body;

    if (!template_type) {
      return NextResponse.json({ success: false, error: "template_type is required" }, { status: 400 });
    }

    if (!booking_id && !invoice_id) {
      return NextResponse.json({ success: false, error: "Either booking_id or invoice_id is required" }, { status: 400 });
    }

    // Use admin client for data fetching
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let payload: WhatsAppPayload;

    if (template_type === "bill_summary" && invoice_id) {
      const { data: invoice, error: invoiceError } = await supabaseAdmin
        .from("invoices")
        .select(`
          id,
          invoice_number,
          total_amount,
          bookings (
            id,
            check_in_date,
            check_out_date,
            rooms ( room_number ),
            guests ( name, phone )
          )
        `)
        .eq("id", invoice_id)
        .single();

      if (invoiceError || !invoice) {
        return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
      }

      const booking = Array.isArray(invoice.bookings) ? invoice.bookings[0] : invoice.bookings;
      const guest = booking?.guests && (Array.isArray(booking.guests) ? booking.guests[0] : booking.guests);
      const room = booking?.rooms && (Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms);

      if (!guest?.phone) {
        return NextResponse.json({ success: false, error: "Guest phone number not found" }, { status: 404 });
      }

      payload = {
        phone_number: guest.phone,
        message: buildBillSummaryMessage(
          guest.name ?? "Guest",
          invoice.invoice_number ?? invoice_id,
          String(invoice.total_amount ?? "0"),
          room?.room_number ?? "N/A"
        ),
        template_type,
      };
    } else if (booking_id) {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .select(`
          id,
          check_in_date,
          check_out_date,
          rooms ( room_number ),
          guests ( name, phone )
        `)
        .eq("id", booking_id)
        .single();

      if (bookingError || !booking) {
        return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
      }

      const guest = booking.guests && (Array.isArray(booking.guests) ? booking.guests[0] : booking.guests);
      const room = booking.rooms && (Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms);

      if (!guest?.phone) {
        return NextResponse.json({ success: false, error: "Guest phone number not found" }, { status: 404 });
      }

      const checkInDate = booking.check_in_date
        ? new Date(booking.check_in_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "N/A";
      const checkOutDate = booking.check_out_date
        ? new Date(booking.check_out_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "N/A";

      const message =
        template_type === "check_in_confirmation"
          ? buildCheckInMessage(guest.name ?? "Guest", room?.room_number ?? "N/A", checkInDate, checkOutDate)
          : buildCheckoutReminderMessage(guest.name ?? "Guest", room?.room_number ?? "N/A", checkOutDate);

      payload = {
        phone_number: guest.phone,
        message,
        template_type,
      };
    } else {
      return NextResponse.json({ success: false, error: "Invalid combination of booking_id/invoice_id and template_type" }, { status: 400 });
    }

    // Call the Supabase Edge Function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-whatsapp`;

    const edgeResponse = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const edgeData = await edgeResponse.json();

    if (!edgeResponse.ok || !edgeData.success) {
      console.error("Edge function error:", edgeData);
      return NextResponse.json(
        { success: false, error: edgeData.error ?? "Failed to send WhatsApp message" },
        { status: edgeResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message_id: edgeData.message_id,
      recipient: edgeData.recipient,
      template_type,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("WhatsApp API route error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
