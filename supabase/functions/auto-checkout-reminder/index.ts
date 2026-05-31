import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface BookingRow {
  id: string;
  check_out_date: string;
  hotel_id: string;
  guests: { name: string; phone: string | null } | null;
  rooms: { room_number: string } | null;
}

interface ReminderSummary {
  booking_id: string;
  guest_name: string;
  room_number: string;
  notification_created: boolean;
  whatsapp_sent: boolean;
  whatsapp_error?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Supabase credentials not configured" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get today's date in YYYY-MM-DD format (UTC)
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Find all bookings checking out today with status = checked_in
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        check_out_date,
        hotel_id,
        guests ( name, phone ),
        rooms ( room_number )
      `)
      .eq("check_out_date", todayStr)
      .eq("status", "checked_in");

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError.message);
      return new Response(
        JSON.stringify({ success: false, error: bookingsError.message }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No checkouts due today", reminders_sent: 0, summary: [] }),
        { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Check if WhatsApp feature is globally enabled via hotel settings
    // We'll check per hotel_id for the whatsapp_enabled flag
    const hotelIds = [...new Set((bookings as BookingRow[]).map((b) => b.hotel_id).filter(Boolean))];
    const whatsappEnabledHotels = new Set<string>();

    for (const hotelId of hotelIds) {
      const { data: settings } = await supabase
        .from("hotel_settings")
        .select("whatsapp_enabled")
        .eq("hotel_id", hotelId)
        .single();

      if (settings?.whatsapp_enabled === true) {
        whatsappEnabledHotels.add(hotelId);
      }
    }

    const summary: ReminderSummary[] = [];

    for (const booking of bookings as BookingRow[]) {
      const guest = Array.isArray(booking.guests) ? booking.guests[0] : booking.guests;
      const room = Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms;

      const guestName = guest?.name ?? "Guest";
      const roomNumber = room?.room_number ?? "N/A";
      const checkOutFormatted = new Date(booking.check_out_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      let notificationCreated = false;
      let whatsappSent = false;
      let whatsappError: string | undefined;

      // Create notification in notifications table
      const { error: notificationError } = await supabase.from("notifications").insert({
        hotel_id: booking.hotel_id,
        type: "checkout_reminder",
        title: "Checkout Reminder",
        message: `Guest ${guestName} in Room ${roomNumber} is due for checkout today (${checkOutFormatted}).`,
        entity_type: "booking",
        entity_id: booking.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (notificationError) {
        console.error(`Failed to create notification for booking ${booking.id}:`, notificationError.message);
      } else {
        notificationCreated = true;
      }

      // Send WhatsApp if enabled for this hotel and guest has a phone
      if (whatsappEnabledHotels.has(booking.hotel_id) && guest?.phone) {
        const whatsappMessage =
          `Hello ${guestName}! ⏰\n\n` +
          `This is a friendly reminder that your check-out is scheduled for today, ${checkOutFormatted}.\n\n` +
          `Room: ${roomNumber}\n\n` +
          `Please visit the reception desk to complete your check-out. We hope you had a wonderful stay! 🌟`;

        const sendWhatsAppUrl = `${SUPABASE_URL}/functions/v1/send-whatsapp`;

        try {
          const waResponse = await fetch(sendWhatsAppUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              phone_number: guest.phone,
              message: whatsappMessage,
              template_type: "checkout_reminder",
            }),
          });

          const waData = await waResponse.json();

          if (waData.success) {
            whatsappSent = true;
          } else {
            whatsappError = waData.error ?? "Unknown WhatsApp error";
            console.error(`WhatsApp failed for booking ${booking.id}:`, whatsappError);
          }
        } catch (waErr: unknown) {
          whatsappError = waErr instanceof Error ? waErr.message : "WhatsApp fetch failed";
          console.error(`WhatsApp exception for booking ${booking.id}:`, whatsappError);
        }
      }

      summary.push({
        booking_id: booking.id,
        guest_name: guestName,
        room_number: roomNumber,
        notification_created: notificationCreated,
        whatsapp_sent: whatsappSent,
        ...(whatsappError ? { whatsapp_error: whatsappError } : {}),
      });
    }

    const totalSent = summary.filter((s) => s.notification_created).length;
    const whatsappCount = summary.filter((s) => s.whatsapp_sent).length;

    return new Response(
      JSON.stringify({
        success: true,
        date: todayStr,
        reminders_sent: totalSent,
        whatsapp_messages_sent: whatsappCount,
        total_checkouts_today: bookings.length,
        summary,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("auto-checkout-reminder error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
