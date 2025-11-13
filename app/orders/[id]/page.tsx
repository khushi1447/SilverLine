import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import PaymentStatus from '@/components/PaymentStatus'
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid'

interface OrderPageProps {
  params: Promise<{
    id: string
  }>
}

async function getOrder(id: string, userId?: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: parseInt(id),
      ...(userId ? { userId: parseInt(userId) } : {})
    },
    include: {
      user: true,
      orderItems: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      },
      payments: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      shipping: true
    }
  })

  return order
}

const statusConfig = {
  PENDING: { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Order Pending' },
  CONFIRMED: { color: 'text-green-600', bg: 'bg-green-50', label: 'Order Confirmed' },
  PROCESSING: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processing' },
  SHIPPED: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Shipped' },
  DELIVERED: { color: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
  CANCELLED: { color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
  REFUNDED: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Refunded' }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await getServerSession()
  const { id } = await params
  const order = await getOrder(id, session?.user?.id)

  if (!order) {
    notFound()
  }

  const latestPayment = order.payments[0]
  const config = statusConfig[order.status]

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bg} ${config.color} mb-4`}>
            {order.status === 'CONFIRMED' || order.status === 'DELIVERED' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : order.status === 'PENDING' ? (
              <ClockIcon className="h-5 w-5" />
            ) : order.status === 'CANCELLED' || order.status === 'REFUNDED' ? (
              <XCircleIcon className="h-5 w-5" />
            ) : (
              <ClockIcon className="h-5 w-5" />
            )}
            {config.label}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-600 mt-2">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0].url}
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-gray-900 font-medium">{formatCurrency(Number(item.totalPrice))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="text-gray-600">
                <p className="font-medium">{(order.shippingAddress as any).name}</p>
                <p>{(order.shippingAddress as any).address}</p>
                <p>{(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).zipCode}</p>
                <p className="mt-2">Phone: {(order.shippingAddress as any).phone}</p>
                <p>Email: {(order.shippingAddress as any).email}</p>
              </div>
            </div>
          </div>

          {/* Order Summary & Payment Status */}
          <div className="space-y-6">
            {/* Payment Status */}
            {latestPayment && (
              <PaymentStatus
                status={latestPayment.status}
                amount={Number(latestPayment.amount)}
                currency={latestPayment.currency}
                transactionId={latestPayment.transactionId || undefined}
                paidAt={latestPayment.paidAt}
              />
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{Number(order.shippingCost) > 0 ? formatCurrency(Number(order.shippingCost)) : 'Free'}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(Number(order.totalAmount))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {order.shipping?.trackingNumber && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking Information</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Carrier:</span> {order.shipping.carrier}</p>
                  <p><span className="font-medium">Tracking Number:</span> {order.shipping.trackingNumber}</p>
                  {order.shipping.estimatedDelivery && (
                    <p><span className="font-medium">Estimated Delivery:</span> {formatDate(order.shipping.estimatedDelivery)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}