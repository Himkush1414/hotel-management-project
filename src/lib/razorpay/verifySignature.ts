import crypto from 'crypto'

export interface VerifySignatureParams {
  razorpay_order_id:   string
  razorpay_payment_id: string
  razorpay_signature:  string
}

export function verifySignature(params: VerifySignatureParams): boolean {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = params

  const body = `${razorpay_order_id}|${razorpay_payment_id}`

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  return expectedSignature === razorpay_signature
}
