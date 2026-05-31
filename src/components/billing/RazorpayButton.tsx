'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayInstance {
  open: () => void
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayButtonProps {
  amount: number
  invoiceId: string
  guestName: string
  onSuccess: (transactionId: string) => void
  label?: string
}

export function RazorpayButton({
  amount,
  invoiceId,
  guestName,
  onSuccess,
  label = 'Pay Online',
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false)
  const { error } = useToast()

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise(resolve => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        error('Failed to load payment gateway. Please try again.')
        return
      }

      // Create order on server
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to paise
          invoiceId,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        error(data.error ?? 'Failed to create payment order')
        return
      }

      const order = await res.json() as {
        orderId: string
        amount: number
        currency: string
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: order.amount,
        currency: order.currency,
        name: 'Hotel Management System',
        description: `Payment for Invoice`,
        order_id: order.orderId,
        handler: async (response: RazorpayResponse) => {
          // Verify signature on server
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          })

          if (verifyRes.ok) {
            onSuccess(response.razorpay_payment_id)
          } else {
            error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: guestName,
        },
        theme: {
          color: '#0f172a',
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading}
      className="w-full"
    >
      {loading ? 'Opening Payment...' : label}
    </Button>
  )
}
