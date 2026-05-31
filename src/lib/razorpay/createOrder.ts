import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface CreateOrderParams {
  amount:     number // in paise (multiply INR by 100)
  currency?:  string
  receipt:    string
  notes?:     Record<string, string>
}

export interface RazorpayOrder {
  id:         string
  entity:     string
  amount:     number
  currency:   string
  receipt:    string
  status:     string
  created_at: number
}

export async function createOrder(
  params: CreateOrderParams
): Promise<RazorpayOrder> {
  const order = await razorpay.orders.create({
    amount:   params.amount,
    currency: params.currency ?? 'INR',
    receipt:  params.receipt,
    notes:    params.notes ?? {},
  })

  return order as RazorpayOrder
}
