import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get current date and previous month for comparison
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Get all stats in parallel
    const [
      totalOrders,
      currentMonthOrders,
      previousMonthOrders,
      totalProducts,
      totalCustomers,
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      recentOrders,
      lowStockProducts,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      // Total counts
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: currentMonth } }
      }),
      prisma.order.count({
        where: { 
          createdAt: { 
            gte: previousMonth,
            lte: previousMonthEnd
          }
        }
      }),
      prisma.product.count(),
      prisma.user.count({ where: { isAdmin: false } }),
      
      // Revenue calculations
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { 
          status: "DELIVERED",
          createdAt: { gte: currentMonth }
        },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where: { 
          status: "DELIVERED",
          createdAt: { 
            gte: previousMonth,
            lte: previousMonthEnd
          }
        },
        _sum: { totalAmount: true }
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          orderItems: {
            select: {
              id: true,
              quantity: true,
            }
          }
        }
      }),
      
      // Low stock products
      prisma.product.count({
        where: { stock: { lte: 10 } }
      }),
      
      // Order status counts
      prisma.order.count({
        where: { status: "PENDING" }
      }),
      prisma.order.count({
        where: { status: "DELIVERED" }
      }),
    ]);
    
    // Calculate percentage changes
    const ordersChange = previousMonthOrders > 0 
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders * 100)
      : 0;
    
    const previousTotal = Number(previousMonthRevenue._sum.totalAmount || 0);
    const currentTotal = Number(currentMonthRevenue._sum.totalAmount || 0);
    const revenueChange = previousTotal > 0
      ? ((currentTotal - previousTotal) / previousTotal * 100)
      : 0;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };
    
    // Transform recent orders
    const transformedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        id: order.user?.id || 0,
        name: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown Customer',
        email: order.user?.email || 'No email',
      },
      totalAmount: Number(order.totalAmount),
      status: order.status,
      itemCount: order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      createdAt: order.createdAt.toISOString(),
    }));
    
    const response = {
      overview: {
        totalRevenue: {
          value: formatCurrency(Number(totalRevenue._sum.totalAmount || 0)),
          change: revenueChange,
          current: Number(currentMonthRevenue._sum.totalAmount || 0),
          previous: Number(previousMonthRevenue._sum.totalAmount || 0),
        },
        totalOrders: {
          value: totalOrders,
          change: ordersChange,
          current: currentMonthOrders,
          previous: previousMonthOrders,
        },
        totalProducts: {
          value: totalProducts,
          change: 0, // Would need historical data
        },
        totalCustomers: {
          value: totalCustomers,
          change: 0, // Would need historical data
        },
      },
      status: {
        pendingOrders,
        completedOrders,
        lowStockProducts,
      },
      recentOrders: transformedRecentOrders,
    };

    console.log('Admin stats response:', {
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrdersCount: transformedRecentOrders.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
