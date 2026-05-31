import "server-only";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CreateOrderParams {
  amount: number;
  invoiceId: string;
  currency?: string;
}

interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
}

export async function createRazorpayOrder({
  amount,
  invoiceId,
  currency = "INR",
}: CreateOrderParams): Promise<CreateOrderResult> {
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: invoiceId,
    notes: {
      invoice_id: invoiceId,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
  };
}
