import Razorpay from 'razorpay'
import crypto from 'crypto'

// Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Order creation options interface
export interface RazorpayOrderData {
  amount: number // amount in smallest currency unit (paise)
  currency: string
  receipt: string
  notes?: Record<string, string>
}

// Payment verification interface
export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

// Create Razorpay order
export async function createRazorpayOrder(orderData: RazorpayOrderData): Promise<
  | { success: true; order: any }
  | { success: false; error: string }
> {
  try {
    const order = await razorpay.orders.create({
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      notes: orderData.notes,
    })

    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    }
  }
}

// Verify payment signature
export function verifyRazorpayPayment(verification: RazorpayPaymentVerification): boolean {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification

    // Create expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpay_signature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error)
    return false
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string = process.env.RAZORPAY_WEBHOOK_SECRET!
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

// Convert amount to paise (smallest currency unit)
export function convertToPaise(amount: number): number {
  return Math.round(amount * 100)
}

// Convert amount from paise to rupees
export function convertFromPaise(amount: number): number {
  return amount / 100
}

// Generate receipt ID
export function generateReceiptId(orderNumber?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return orderNumber ? `${orderNumber}_${timestamp}` : `receipt_${timestamp}_${random}`
}

// Razorpay order status
export enum RazorpayOrderStatus {
  CREATED = 'created',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

// Razorpay payment status
export enum RazorpayPaymentStatus {
  CREATED = 'created',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

// Get payment methods for frontend
export function getRazorpayConfig() {
  return {
    key: process.env.RAZORPAY_KEY_ID!,
    currency: 'INR',
    name: 'Elegant Jewelry',
    description: 'Premium Silver & Gold Collection',
    image: '/images/logo.png', // Your logo URL
    theme: {
      color: '#1f2937', // Your brand color
    },
    modal: {
      ondismiss: () => {
        console.log('Razorpay modal dismissed')
      },
    },
  }
}