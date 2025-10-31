import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating users
const updateUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  isAdmin: z.boolean().optional(),
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const search = searchParams.get("search");
    const isAdmin = searchParams.get("isAdmin");
    const status = searchParams.get("status"); // all, customer, admin
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        // Search by full name combination
        {
          AND: [
            { firstName: { contains: search.split(' ')[0] || '', mode: "insensitive" } },
            { lastName: { contains: search.split(' ')[1] || '', mode: "insensitive" } }
          ]
        }
      ];
    }
    
    // Handle status filter (admin, customer, all)
    if (status && status !== "all") {
      if (status === "admin") {
        where.isAdmin = true;
      } else if (status === "customer") {
        where.isAdmin = false;
      }
    }
    
    // Legacy support for isAdmin parameter
    if (isAdmin !== null && !status) {
      where.isAdmin = isAdmin === "true";
    }
    
    // Debug logging
    console.log('Users API - Query params:', { search, status, isAdmin, page, limit });
    console.log('Users API - Where clause:', where);
    
    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
              wishlist: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    
    // Transform users for response
    const transformedUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      stats: {
        orders: user._count.orders,
        reviews: user._count.reviews,
        wishlistItems: user._count.wishlist,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    
    const totalPages = Math.ceil(totalCount / limit);
    
    // Debug logging
    console.log('Users API - Results:', { 
      totalCount, 
      usersCount: transformedUsers.length, 
      adminCount: transformedUsers.filter(u => u.isAdmin).length,
      customerCount: transformedUsers.filter(u => !u.isAdmin).length
    });
    
    return NextResponse.json({
      users: transformedUsers,
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
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 