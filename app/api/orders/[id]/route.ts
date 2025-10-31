import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating order status
const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
        coupon: true,
        shipping: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this order
    const isAdmin = session?.user?.isAdmin || false;
    const isOwner = session?.user?.id && order.userId === parseInt(session.user.id);
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Transform order for response
    const transformedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      user: order.user ? {
        id: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
        phone: order.user.phone,
      } : null,
      items: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          image: item.product.images[0]?.url || "/placeholder.jpg",
        } : null,
      })),
      pricing: {
        subtotal: parseFloat(order.subtotal.toString()),
        taxAmount: parseFloat(order.taxAmount.toString()),
        shippingCost: parseFloat(order.shippingCost.toString()),
        discountAmount: parseFloat(order.discountAmount.toString()),
        totalAmount: parseFloat(order.totalAmount.toString()),
      },
      addresses: {
        billing: order.billingAddress,
        shipping: order.shippingAddress,
      },
      coupon: order.coupon ? {
        code: order.couponCode,
        name: order.coupon.name,
        discountValue: parseFloat(order.coupon.discountValue.toString()),
        discountType: order.coupon.discountType,
      } : null,
      shipping: order.shipping ? {
        method: order.shipping.method,
        cost: parseFloat(order.shipping.cost.toString()),
        trackingNumber: order.shipping.trackingNumber,
        carrier: order.shipping.carrier,
        status: order.shipping.status,
        estimatedDelivery: order.shipping.estimatedDelivery,
        shippedAt: order.shipping.shippedAt,
        deliveredAt: order.shipping.deliveredAt,
        notes: order.shipping.notes,
      } : null,
      payments: order.payments.map(payment => ({
        id: payment.id,
        method: payment.paymentMethod,
        gateway: payment.gateway,
        amount: parseFloat(payment.amount.toString()),
        currency: payment.currency,
        status: payment.status,
        transactionId: payment.transactionId,
        failureReason: payment.failureReason,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      })),
      customerNotes: order.customerNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    
    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const orderId = parseInt(params.id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "Invalid order ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validatedData.status,
      },
    });
    
    // If order is cancelled or refunded, restore stock
    if (validatedData.status === "CANCELLED" || validatedData.status === "REFUNDED") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
      });
      
      await Promise.all(
        orderItems.map(async (item) => {
          return prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        })
      );
    }
    
    return NextResponse.json({
      message: "Order status updated successfully",
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
} 