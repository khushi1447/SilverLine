import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating orders
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).min(1, "At least one item is required"),
  billingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phone: z.string().optional(),
  }),
  customerNotes: z.string().optional(),
  couponCode: z.string().optional(),
  guestInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const status = searchParams.get("status");
    const isAdmin = session?.user?.isAdmin || false;
    
    if (!session?.user?.id && !isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Build where clause
    const where: any = {};
    
    // Non-admin users can only see their own orders
    if (!isAdmin) {
      where.userId = parseInt(session!.user!.id);
    }
    
    // Status filter - map lowercase to uppercase for Prisma enum
    if (status && status !== "all") {
      const statusMap: { [key: string]: string } = {
        "pending": "PENDING",
        "confirmed": "CONFIRMED", 
        "processing": "PROCESSING",
        "shipped": "SHIPPED",
        "delivered": "DELIVERED",
        "cancelled": "CANCELLED",
        "refunded": "REFUNDED"
      };
      where.status = statusMap[status.toLowerCase()] || status.toUpperCase();
    }
    
    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    
    // Transform orders for response
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      user: order.user ? {
        id: order.user.id,
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
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
      })),
      pricing: {
        subtotal: parseFloat(order.subtotal.toString()),
        taxAmount: parseFloat(order.taxAmount.toString()),
        shippingCost: parseFloat(order.shippingCost.toString()),
        discountAmount: parseFloat(order.discountAmount.toString()),
        totalAmount: parseFloat(order.totalAmount.toString()),
      },
      coupon: order.coupon ? {
        code: order.couponCode,
        name: order.coupon.name,
        discountValue: parseFloat(order.coupon.discountValue.toString()),
      } : null,
      shipping: order.shipping ? {
        method: order.shipping.method,
        trackingNumber: order.shipping.trackingNumber,
        carrier: order.shipping.carrier,
        status: order.shipping.status,
        estimatedDelivery: order.shipping.estimatedDelivery,
      } : null,
      payment: order.payments[0] ? {
        method: order.payments[0].paymentMethod,
        status: order.payments[0].status,
        amount: parseFloat(order.payments[0].amount.toString()),
        transactionId: order.payments[0].transactionId,
      } : null,
      customerNotes: order.customerNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);
    
    // Check if user is authenticated or guest info is provided
    if (!session?.user?.id && !validatedData.guestInfo) {
      return NextResponse.json(
        { error: "Authentication required or guest info must be provided" },
        { status: 401 }
      );
    }
    
    // Get cart items (from database for authenticated users or from request for guests)
    let cartItems;
    if (session?.user?.id) {
      // Get cart from database for authenticated users
      cartItems = await prisma.cartItem.findMany({
        where: { userId: parseInt(session.user.id) },
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
      });
    } else {
      // For guests, validate that provided items exist and are in stock
      cartItems = await Promise.all(
        validatedData.items.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          });
          
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }
          
          // Product is available if it exists
          
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            product,
          };
        })
      );
    }
    
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }
    
    // Calculate pricing
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.price.toString());
      return sum + (price * item.quantity);
    }, 0);
    
    // Apply coupon if provided
    let discountAmount = 0;
    let coupon = null;
    if (validatedData.couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: validatedData.couponCode },
      });
      
      if (coupon && coupon.isActive) {
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (subtotal * parseFloat(coupon.discountValue.toString())) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount.toString()));
          }
        } else {
          discountAmount = parseFloat(coupon.discountValue.toString());
        }
      }
    }
    
    // Calculate shipping (simplified - you can implement more complex logic)
    const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over ₹100
    
    // Calculate tax (simplified - you can implement more complex logic)
    const taxAmount = (subtotal - discountAmount) * 0.08; // 8% tax
    
    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount;
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
             // Create order
       const orderData: any = {
         orderNumber,
         status: "PENDING",
         subtotal,
         taxAmount,
         shippingCost,
         discountAmount,
         totalAmount,
         billingAddress: validatedData.billingAddress,
         shippingAddress: validatedData.shippingAddress,
         customerNotes: validatedData.customerNotes,
       };
       
       if (session?.user?.id) {
         orderData.userId = parseInt(session.user.id);
       }
       
       if (coupon?.id) {
         orderData.couponId = coupon.id;
         orderData.couponCode = coupon.code;
       }
       
       const newOrder = await tx.order.create({
         data: orderData,
       });
      
      // Create order items
      const orderItems = await Promise.all(
        cartItems.map(async (item) => {
          const price = parseFloat(item.product.price.toString());
          const totalPrice = price * item.quantity;
          
          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              price,
              totalPrice,
              productName: item.product.name,
              productSku: `PRD-${item.product.id}`,
              productImage: item.product.images[0]?.url || null,
            },
          });
        })
      );
      
      // Update product stock
      await Promise.all(
        cartItems.map(async (item) => {
          return tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        })
      );
      
      // Clear user's cart if authenticated
      if (session?.user?.id) {
        await tx.cartItem.deleteMany({
          where: { userId: parseInt(session.user.id) },
        });
      }
      
      return newOrder;
    });
    
    return NextResponse.json(
      { 
        message: "Order created successfully",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: parseFloat(order.totalAmount.toString()),
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
} 