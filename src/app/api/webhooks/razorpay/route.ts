import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createAdminClient } from "@/lib/supabase/server";

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") ?? "";

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment: {
          entity: {
            id: string;
            order_id: string;
            amount: number;
            notes?: {
              invoice_id?: string;
            };
          };
        };
      };
    };

    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const invoiceId = payment.notes?.invoice_id;

      if (!invoiceId) {
        return NextResponse.json(
          { error: "Invoice ID not found in payment notes" },
          { status: 400 }
        );
      }

      const supabase = await createAdminClient();

      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (invoiceError) {
        console.error("Failed to update invoice:", invoiceError);
        return NextResponse.json(
          { error: "Failed to update invoice" },
          { status: 500 }
        );
      }

      const { data: invoice } = await supabase
        .from("invoices")
        .select("hotel_id, booking_id")
        .eq("id", invoiceId)
        .single();

      if (invoice) {
        await supabase.from("payments").insert({
          hotel_id: invoice.hotel_id,
          invoice_id: invoiceId,
          amount: payment.amount / 100,
          payment_mode: "razorpay",
          razorpay_order_id: payment.order_id,
          razorpay_payment_id: payment.id,
          created_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
