'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact?: string
  }
  theme: {
    color: string
  }
  handler: (response: any) => void
  modal: {
    ondismiss: () => void
  }
}

interface RazorpayCheckoutProps {
  orderId: number
  amount: number
  customerDetails: {
    name: string
    email: string
    phone?: string
  }
  onSuccess: () => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayCheckout({
  orderId,
  amount,
  customerDetails,
  onSuccess,
  onError
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK')
      onError('Failed to load payment gateway. Please try again.')
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [onError])

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      onError('Payment gateway not loaded. Please refresh and try again.')
      return
    }

    setLoading(true)

    try {
      // Get Razorpay configuration
      const configResponse = await fetch('/api/payments/config')
      if (!configResponse.ok) {
        throw new Error('Failed to get payment configuration')
      }
      const { config } = await configResponse.json()

      // Create payment order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'INR',
          customerEmail: customerDetails.email,
          customerName: customerDetails.name,
          customerPhone: customerDetails.phone,
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const { razorpayOrder } = await orderResponse.json()

      // Initialize Razorpay checkout
      const options: RazorpayOptions = {
        key: config.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: config.name,
        description: config.description,
        order_id: razorpayOrder.id,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: config.theme,
        handler: async (response: any) => {
          await verifyPayment(response)
        },
        modal: {
          ondismiss: () => {
            setLoading(false)
            onError('Payment cancelled by user')
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment initialization error:', error)
      setLoading(false)
      onError(error instanceof Error ? error.message : 'Failed to initialize payment')
    }
  }

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: 'razorpay',
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          amount,
        }),
      })

      const result = await verifyResponse.json()

      if (result.success) {
        toast.success('Payment successful! Your order has been confirmed.')
        onSuccess()
        router.push(`/orders/${result.order.id}`)
      } else {
        throw new Error(result.error || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      onError(error instanceof Error ? error.message : 'Payment verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading || !razorpayLoaded}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </>
      ) : !razorpayLoaded ? (
        'Loading Payment Gateway...'
      ) : (
        'Pay with Razorpay'
      )}
    </button>
  )
}