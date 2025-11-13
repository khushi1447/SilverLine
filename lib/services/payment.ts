import { prisma } from '@/lib/db'
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  convertToPaise,
  generateReceiptId,
  type RazorpayPaymentVerification
} from '@/lib/razorpay'
import { createDelhiveryShipment } from '@/lib/services/delhivery'

export interface CreatePaymentOrderData {
  orderId: number
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  customerPhone?: string
}

export interface ProcessPaymentData {
  orderId: number
  paymentMethod: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  amount: number
}

// Create payment order
export async function createPaymentOrder(
  data: CreatePaymentOrderData
): Promise<
  | {
      success: true
      payment: any
      order: { id: number; orderNumber: string; total: any }
      razorpayOrder: any
      razorpayOrderId: string
    }
  | { success: false; error: string }
> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return {
        success: false,
        error: 'Order not found'
      }
    }

    // Create Razorpay order
    const receiptId = generateReceiptId(order.orderNumber)
    const amountPaise = convertToPaise(data.amount)
    const razorpayResult = await createRazorpayOrder({
      amount: amountPaise,
      currency: data.currency,
      receipt: receiptId,
      notes: {
        orderId: String(order.id),
        orderNumber: order.orderNumber,
        customerEmail: data.customerEmail,
      }
    })

    if (!razorpayResult.success) {
      return {
        success: false,
        error: razorpayResult.error || 'Failed to create payment order'
      }
    }

    // Persist payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: data.amount,
        currency: data.currency,
        status: 'PENDING',
        paymentMethod: 'CREDIT_CARD',
        gateway: 'razorpay',
        transactionId: razorpayResult.order.id,
        gatewayResponse: JSON.parse(JSON.stringify(razorpayResult.order)),
      }
    })

    return {
      success: true,
      payment,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.totalAmount
      },
      razorpayOrder: razorpayResult.order,
      razorpayOrderId: razorpayResult.order.id
    }
  } catch (error) {
    console.error('Error creating payment order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order'
    }
  }
}

// Process payment
export async function processPayment(
  data: ProcessPaymentData
): Promise<
  | {
      success: true
      payment: any
      order: any
      paymentStatus: 'COMPLETED' | 'FAILED'
      message: string
    }
  | { success: false; error: string }
> {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        orderId: data.orderId,
        transactionId: data.razorpayOrderId
      }
    })

    if (!payment) {
      return {
        success: false,
        error: 'Payment record not found'
      }
    }

    let paymentStatus: 'COMPLETED' | 'FAILED' = 'FAILED'
    let orderStatus: 'CONFIRMED' | 'CANCELLED' = 'CANCELLED'

    if (data.paymentMethod === 'razorpay' && data.razorpayPaymentId && data.razorpaySignature) {
      // Verify Razorpay payment
      const isValidPayment = verifyRazorpayPayment({
        razorpay_order_id: data.razorpayOrderId!,
        razorpay_payment_id: data.razorpayPaymentId,
        razorpay_signature: data.razorpaySignature
      })

      if (isValidPayment) {
        paymentStatus = 'COMPLETED'
        orderStatus = 'CONFIRMED'
      }
    }

    // Update payment record
    const baseGateway = (typeof payment.gatewayResponse === 'object' && payment.gatewayResponse !== null)
      ? (payment.gatewayResponse as any)
      : {}

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        paidAt: paymentStatus === 'COMPLETED' ? new Date() : null,
        gatewayResponse: {
          ...baseGateway,
          paymentId: data.razorpayPaymentId,
          signature: data.razorpaySignature,
          verifiedAt: new Date().toISOString()
        }
      }
    })

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: data.orderId },
      data: {
        status: orderStatus
      },
      include: {
        user: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock if payment successful
    if (paymentStatus === 'COMPLETED') {
      for (const item of updatedOrder.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      // Create Delhivery shipment after successful payment
      try {
        console.log('Creating Delhivery shipment for order:', data.orderId)
        const shipmentResult = await createDelhiveryShipment({
          orderId: data.orderId
        })

        if (shipmentResult.success) {
          console.log('Delhivery shipment created successfully:', shipmentResult.trackingNumber)
          // Additional logging or notification can be added here
        } else {
          console.error('Failed to create Delhivery shipment:', shipmentResult.error)
          // Log the error but don't fail the payment process
          // The order is still confirmed, shipping can be handled manually
        }
      } catch (shipmentError) {
        console.error('Error creating Delhivery shipment:', shipmentError)
        // Don't fail the payment if shipment creation fails
        // This ensures the order is still confirmed and can be handled manually
      }
    }

    // Return discriminated union based on paymentStatus
    if (paymentStatus === 'COMPLETED') {
      return {
        success: true,
        payment: updatedPayment,
        order: updatedOrder,
        paymentStatus,
        message: 'Payment successful! Your order has been confirmed.'
      }
    }

    return {
      success: false,
      error: 'Payment verification failed. Please try again.'
    }

  } catch (error) {
    console.error('Error processing payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment'
    }
  }
}

// Get payment details
export async function getPaymentDetails(orderId: number) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            user: true,
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    return {
      success: true,
      payment
    }
  } catch (error) {
    console.error('Error getting payment details:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payment details'
    }
  }
}

// Refund payment
export async function refundPayment(paymentId: number, amount?: number) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true
      }
    })

    if (!payment) {
      return {
        success: false,
        error: 'Payment not found'
      }
    }

    if (payment.status !== 'COMPLETED') {
      return {
        success: false,
        error: 'Payment is not completed'
      }
    }

    // TODO: Implement Razorpay refund API call here
    // This is a placeholder for actual refund implementation

    // Update payment status
    const baseGateway = (typeof payment.gatewayResponse === 'object' && payment.gatewayResponse !== null)
      ? (payment.gatewayResponse as any)
      : {}

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        gatewayResponse: {
          ...baseGateway,
          refundedAt: new Date().toISOString(),
          refundAmount: amount || payment.amount
        }
      }
    })

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'REFUNDED'
      }
    })

    return {
      success: true,
      message: 'Payment refunded successfully'
    }

  } catch (error) {
    console.error('Error refunding payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refund payment'
    }
  }
}