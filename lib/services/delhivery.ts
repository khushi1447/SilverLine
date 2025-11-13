import { prisma } from '@/lib/db'
import { getDelhiveryService, DelhiveryShipmentRequest, getEnvPickupAddress } from '@/lib/delhivery'
import { OrderStatus, ShippingStatus } from '@prisma/client'

export interface CreateShipmentData {
  orderId: number
  pickupAddress?: {
    name: string
    address: string
    city: string
    state: string
    pin: string
    country: string
    phone: string
    email?: string
  }
}

// Update order and shipping status based on Delhivery tracking
export interface UpdateOrderStatusData {
  orderId: number
  trackingNumber: string
  delhiveryStatus: string
  delhiveryStatusCode: string
  currentLocation: string
  scanDateTime: string
  instructions?: string
  reasonCode?: string
  reasonDescription?: string
}

export interface UpdateOrderStatusResult {
  success: boolean
  error?: string
  newOrderStatus?: OrderStatus
  newShippingStatus?: ShippingStatus
}

export async function updateOrderStatusFromDelhivery(data: UpdateOrderStatusData): Promise<UpdateOrderStatusResult> {
  try {
    // Map Delhivery status to our shipping status
    const shippingStatusMap: Record<string, ShippingStatus> = {
      manifest: 'PENDING',
      in_transit: 'IN_TRANSIT',
      dispatched: 'SHIPPED',
      picked_up: 'PROCESSING',
      out_for_delivery: 'OUT_FOR_DELIVERY',
      delivered: 'DELIVERED',
      undelivered: 'FAILED',
      rto: 'RETURNED',
      cancelled: 'FAILED',
    }

    // Map Delhivery status to our order status (limited to available enum)
    const orderStatusMap: Record<string, OrderStatus> = {
      manifest: 'CONFIRMED',
      in_transit: 'SHIPPED',
      dispatched: 'SHIPPED',
      picked_up: 'PROCESSING',
      out_for_delivery: 'SHIPPED',
      delivered: 'DELIVERED',
      undelivered: 'CANCELLED',
      rto: 'CANCELLED',
      cancelled: 'CANCELLED',
    }

    const delStatus = data.delhiveryStatus.toLowerCase()
    const newShippingStatus = shippingStatusMap[delStatus] || 'PENDING'
    const newOrderStatus = orderStatusMap[delStatus] || 'CONFIRMED'

    // Update shipping record (trackingNumber is not unique; use updateMany)
    await prisma.shipping.updateMany({
      where: { trackingNumber: data.trackingNumber },
      data: {
        status: newShippingStatus,
        notes: `${data.delhiveryStatus} - ${data.reasonDescription || data.instructions || ''} at ${data.currentLocation}`,
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: newOrderStatus },
    })

    return {
      success: true,
      newOrderStatus,
      newShippingStatus,
    }
  } catch (error) {
    console.error('Error updating order status from Delhivery:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    }
  }
}

export interface ShipmentResult {
  success: boolean
  trackingNumber?: string
  shipmentId?: string
  error?: string
  message?: string
}

/**
 * Create Delhivery shipment for an order after successful payment
 */
export async function createDelhiveryShipment(data: CreateShipmentData): Promise<ShipmentResult> {
  try {
    // Get order details with all necessary information
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        user: true,
        orderItems: { include: { product: true } },
        payments: true,
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Check if payment is successful
    const successfulPayment = order.payments.find((p) => p.status === 'COMPLETED')
    if (!successfulPayment) {
      return { success: false, error: 'Payment not completed for this order' }
    }

    // Parse shipping address
    let shippingAddress: any
    try {
      shippingAddress = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress
    } catch (error) {
      return { success: false, error: 'Invalid shipping address format' }
    }

    // Prepare shipment data for Delhivery
    const shipmentRequest: DelhiveryShipmentRequest = {
      // Use env-configured pickup to match a registered ClientWarehouse in Delhivery
      pickup_location: data.pickupAddress || getEnvPickupAddress(),
      shipments: [
        {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          add: `${shippingAddress.address1}${shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''}`,
          city: shippingAddress.city,
          state: shippingAddress.state,
          country: shippingAddress.country || 'India',
          pin: shippingAddress.postalCode,
          phone: shippingAddress.phone || order.user.phone || '+919999999999',
          email: order.user.email,
          order: order.orderNumber,
          products_desc: order.orderItems.map((item) => `${item.productName} (${item.quantity})`).join(', '),
          weight: calculateTotalWeight(order.orderItems).toString(),
          payment_mode: 'Pre-paid',
          // Return address (same as pickup address for now)
          return_name: data.pickupAddress?.name || 'Elegant Jewelry Store',
          return_add: data.pickupAddress?.address || '123 Jewelry Street, Commercial Area',
          return_city: data.pickupAddress?.city || 'Mumbai',
          return_state: data.pickupAddress?.state || 'Maharashtra',
          return_country: data.pickupAddress?.country || 'India',
          return_pin: data.pickupAddress?.pin || '400001',
          return_phone: data.pickupAddress?.phone || '+919999999999',
          return_email: data.pickupAddress?.email || 'support@elegantjewelry.com',
        },
      ],
    }

    // Create shipment with Delhivery
    const delhiveryService = getDelhiveryService()
    const shipmentResponse = await delhiveryService.createShipment(shipmentRequest)

    if (shipmentResponse.success && shipmentResponse.packages.length > 0) {
      const packageInfo = shipmentResponse.packages[0]

      if (packageInfo.serviceable) {
        // Update order with tracking information
        await prisma.shipping.create({
          data: {
            orderId: order.id,
            method: 'STANDARD',
            cost: 0,
            trackingNumber: packageInfo.waybill,
            carrier: 'Delhivery',
            status: 'PROCESSING',
            estimatedDelivery: calculateEstimatedDelivery(),
          },
        })

        // Update order status to processing
        await prisma.order.update({ where: { id: order.id }, data: { status: 'PROCESSING' } })

        return {
          success: true,
          trackingNumber: packageInfo.waybill,
          shipmentId: packageInfo.refnum,
          message: 'Shipment created successfully with Delhivery',
        }
      } else {
        return {
          success: false,
          error: `Delivery not serviceable to ${shippingAddress.city}, ${shippingAddress.state}. Reason: ${packageInfo.message}`,
        }
      }
    } else {
      return { success: false, error: shipmentResponse.error || 'Failed to create shipment with Delhivery' }
    }
  } catch (error) {
    console.error('Error creating Delhivery shipment:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create shipment' }
  }
}

/**
 * Track Delhivery shipment
 */
export async function trackDelhiveryShipment(trackingNumber: string) {
  try {
    const delhiveryService = getDelhiveryService()
    const trackingResponse = await delhiveryService.trackShipment(trackingNumber)

    if (trackingResponse.success && trackingResponse.tracking_data.shipment_data.length > 0) {
      const shipmentData = trackingResponse.tracking_data.shipment_data[0]

      // Update shipping status in database
      await prisma.shipping.updateMany({
        where: { trackingNumber },
        data: {
          status: mapDelhiveryStatusToShippingStatus(shipmentData.current_status_type),
          deliveredAt: shipmentData.delivered_at ? new Date(shipmentData.delivered_at) : undefined,
          notes: `Last status: ${shipmentData.current_status} at ${shipmentData.current_status_location}`,
        },
      })

      // Update order status if delivered
      if (shipmentData.current_status_type === 'DELIVERED') {
        const shipping = await prisma.shipping.findFirst({ where: { trackingNumber }, include: { order: true } })

        if (shipping && shipping.order) {
          await prisma.order.update({ where: { id: shipping.order.id }, data: { status: 'DELIVERED' } })
        }
      }

      return { success: true, trackingData: shipmentData }
    } else {
      return { success: false, error: trackingResponse.error || 'No tracking data found' }
    }
  } catch (error) {
    console.error('Error tracking Delhivery shipment:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to track shipment' }
  }
}

/**
 * Calculate total weight of order items (approximation)
 */
function calculateTotalWeight(orderItems: any[]): number {
  const weightMap: { [key: string]: number } = {
    ring: 5,
    necklace: 20,
    earring: 3,
    bracelet: 15,
    chain: 10,
    pendant: 8,
    bangle: 25,
    anklet: 12,
  }

  let totalWeight = 0
  orderItems.forEach((item) => {
    const productName = item.productName.toLowerCase()
    let itemWeight = 10

    for (const [keyword, weight] of Object.entries(weightMap)) {
      if (productName.includes(keyword)) {
        itemWeight = weight
        break
      }
    }

    totalWeight += itemWeight * item.quantity
  })

  return Math.max(totalWeight, 50)
}

/**
 * Calculate estimated delivery date (3-7 business days from now)
 */
function calculateEstimatedDelivery(): Date {
  const today = new Date()
  const deliveryDays = 3 + Math.floor(Math.random() * 4)
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + deliveryDays)
  return deliveryDate
}

/**
 * Map Delhivery status to our shipping status
 */
function mapDelhiveryStatusToShippingStatus(delhiveryStatus: string): ShippingStatus {
  const statusMap: { [key: string]: ShippingStatus } = {
    PENDING: 'PENDING',
    PICKED_UP: 'PROCESSING',
    IN_TRANSIT: 'IN_TRANSIT',
    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
    DELIVERED: 'DELIVERED',
    RETURNED: 'RETURNED',
    CANCELLED: 'FAILED',
    FAILED: 'FAILED',
  }

  return statusMap[delhiveryStatus] || 'PROCESSING'
}
