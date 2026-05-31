import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type TemplateType = "check_in_confirmation" | "bill_summary" | "checkout_reminder";

interface RequestBody {
  phone_number: string;
  message: string;
  template_type: TemplateType;
}

interface WhatsAppTextMessage {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text";
  text: {
    preview_url: boolean;
    body: string;
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY");
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID) {
      return new Response(
        JSON.stringify({ success: false, error: "WhatsApp credentials not configured" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { phone_number, message, template_type } = body;

    if (!phone_number || !message || !template_type) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: phone_number, message, template_type" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const validTemplates: TemplateType[] = ["check_in_confirmation", "bill_summary", "checkout_reminder"];
    if (!validTemplates.includes(template_type)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid template_type. Must be one of: ${validTemplates.join(", ")}` }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Normalize phone number — remove spaces, ensure + prefix
    const normalizedPhone = phone_number.replace(/\s+/g, "").startsWith("+")
      ? phone_number.replace(/\s+/g, "")
      : `+${phone_number.replace(/\s+/g, "")}`;

    const payload: WhatsAppTextMessage = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    };

    const whatsappUrl = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const whatsappResponse = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const whatsappData = await whatsappResponse.json();

    if (!whatsappResponse.ok) {
      console.error("WhatsApp API error:", JSON.stringify(whatsappData));
      return new Response(
        JSON.stringify({
          success: false,
          error: "WhatsApp API request failed",
          details: whatsappData,
        }),
        { status: whatsappResponse.status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: whatsappData?.messages?.[0]?.id ?? null,
        template_type,
        recipient: normalizedPhone,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("send-whatsapp function error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
