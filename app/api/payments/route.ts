import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating payments
const createPaymentSchema = z.object({
  orderId: z.number().int().positive(),
  paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING", "WALLET", "COD", "BANK_TRANSFER"]),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  gateway: z.string().optional(),
  transactionId: z.string().optional(),
  gatewayResponse: z.any().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { order: { user: { firstName: { contains: search, mode: "insensitive" } } } },
        { order: { user: { lastName: { contains: search, mode: "insensitive" } } } },
        { order: { user: { email: { contains: search, mode: "insensitive" } } } },
      ];
    }
    
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    
    if (method && method !== "all") {
      where.paymentMethod = method.toUpperCase();
    }
    
    // Get payments with pagination
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);
    
    // Transform payments for response
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      customer: {
        id: payment.order.user.id,
        name: `${payment.order.user.firstName} ${payment.order.user.lastName}`,
        email: payment.order.user.email,
      },
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      method: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      gateway: payment.gateway,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
      refundable: payment.status === "COMPLETED",
    }));
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      payments: transformedPayments,
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
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);
    
    // Check if user is authorized
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = parseInt(session.user.id);
    
    // Get order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: validatedData.orderId },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Check if user owns this order or is admin
    const isAdmin = session.user.isAdmin || false;
    if (!isAdmin && order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if order is in a valid state for payment
    if (order.status === "CANCELLED" || order.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Order cannot be paid" },
        { status: 400 }
      );
    }
    
    // Check if payment already exists and is successful
    const existingPayment = order.payments[0];
    if (existingPayment && existingPayment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Payment already completed for this order" },
        { status: 400 }
      );
    }
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: validatedData.orderId,
        paymentMethod: validatedData.paymentMethod,
        gateway: validatedData.gateway || "manual",
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: "PENDING",
        transactionId: validatedData.transactionId,
        gatewayResponse: validatedData.gatewayResponse,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Payment created successfully",
        payment: {
          id: payment.id,
          orderId: payment.orderId,
          amount: parseFloat(payment.amount.toString()),
          status: payment.status,
          transactionId: payment.transactionId,
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
    
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { paymentId, status, transactionId, gatewayResponse, failureReason } = body;
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        gatewayResponse,
        failureReason,
        paidAt: status === "COMPLETED" ? new Date() : null,
      },
      include: {
        order: true,
      },
    });
    
    // If payment is completed, update order status
    if (status === "COMPLETED") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CONFIRMED" },
      });
    }
    
    return NextResponse.json({
      message: "Payment updated successfully",
      payment: {
        id: payment.id,
        status: payment.status,
        transactionId: payment.transactionId,
      },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
} 