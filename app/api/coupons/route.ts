import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating coupons
const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(20, "Code too long"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderValue: z.number().min(0, "Minimum order value cannot be negative"),
  maxDiscount: z.number().positive("Max discount must be positive").optional(),
  usageLimit: z.number().int().positive("Usage limit must be positive").optional(),
  perUserLimit: z.number().int().positive("Per user limit must be positive").optional(),
  startsAt: z.string().optional(), // ISO date string
  expiresAt: z.string().optional(), // ISO date string
  isActive: z.boolean().default(true),
  applicableProducts: z.string().optional(), // comma-separated product IDs
  applicableCategories: z.string().optional(), // comma-separated category IDs
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
    const isActive = searchParams.get("isActive");
    const discountType = searchParams.get("discountType");
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }
    
    if (discountType) {
      where.discountType = discountType;
    }
    
    // Get coupons with pagination
    const [coupons, totalCount] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);
    
    // Transform coupons for response
    const transformedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: parseFloat(coupon.discountValue.toString()),
      minOrderValue: parseFloat(coupon.minOrderValue.toString()),
      maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount.toString()) : null,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      perUserLimit: coupon.perUserLimit,
      startsAt: coupon.startsAt,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
      applicableProducts: coupon.applicableProducts,
      applicableCategories: coupon.applicableCategories,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    }));
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      coupons: transformedCoupons,
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
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = createCouponSchema.parse(body);
    
    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });
    
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }
    
    // Validate dates
    const now = new Date();
    if (validatedData.startsAt && new Date(validatedData.startsAt) < now) {
      return NextResponse.json(
        { error: "Start date cannot be in the past" },
        { status: 400 }
      );
    }
    
    if (validatedData.expiresAt && new Date(validatedData.expiresAt) <= now) {
      return NextResponse.json(
        { error: "Expiry date must be in the future" },
        { status: 400 }
      );
    }
    
    if (validatedData.startsAt && validatedData.expiresAt) {
      if (new Date(validatedData.startsAt) >= new Date(validatedData.expiresAt)) {
        return NextResponse.json(
          { error: "Start date must be before expiry date" },
          { status: 400 }
        );
      }
    }
    
    // Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: validatedData.code.toUpperCase(),
        name: validatedData.name,
        description: validatedData.description,
        discountType: validatedData.discountType,
        discountValue: validatedData.discountValue,
        minOrderValue: validatedData.minOrderValue,
        maxDiscount: validatedData.maxDiscount,
        usageLimit: validatedData.usageLimit,
        perUserLimit: validatedData.perUserLimit,
        startsAt: validatedData.startsAt ? new Date(validatedData.startsAt) : null,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: validatedData.isActive,
        applicableProducts: validatedData.applicableProducts,
        applicableCategories: validatedData.applicableCategories,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Coupon created successfully",
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          discountType: coupon.discountType,
          discountValue: parseFloat(coupon.discountValue.toString()),
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
    
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
} 