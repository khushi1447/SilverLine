import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature)

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    console.log('Razorpay webhook event:', event.event)

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity

        // Update payment status in database
        await prisma.payment.updateMany({
          where: {
            transactionId: payment.order_id,
            status: 'PENDING'
          },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
            gatewayResponse: {
              ...payment,
              webhook_event: event.event,
              processed_at: new Date().toISOString()
            }
          }
        })

        // Update order status
        const paymentRecord = await prisma.payment.findFirst({
          where: {
            transactionId: payment.order_id
          },
          include: {
            order: true
          }
        })

        if (paymentRecord) {
          await prisma.order.update({
            where: { id: paymentRecord.orderId },
            data: { status: 'CONFIRMED' }
          })
        }

        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity

        // Update payment status to failed
        await prisma.payment.updateMany({
          where: {
            transactionId: payment.order_id,
          },
          data: {
            status: 'FAILED',
            failureReason: payment.error_description || 'Payment failed',
            gatewayResponse: {
              ...payment,
              webhook_event: event.event,
              processed_at: new Date().toISOString()
            }
          }
        })

        // Update order status
        const paymentRecord = await prisma.payment.findFirst({
          where: {
            transactionId: payment.order_id
          }
        })

        if (paymentRecord) {
          await prisma.order.update({
            where: { id: paymentRecord.orderId },
            data: { status: 'CANCELLED' }
          })
        }

        break
      }

      case 'refund.processed': {
        const refund = event.payload.refund.entity

        // Update payment status to refunded
        await prisma.payment.updateMany({
          where: {
            transactionId: refund.payment_id
          },
          data: {
            status: 'REFUNDED',
            gatewayResponse: {
              refund_id: refund.id,
              refund_amount: refund.amount,
              webhook_event: event.event,
              processed_at: new Date().toISOString()
            }
          }
        })

        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}