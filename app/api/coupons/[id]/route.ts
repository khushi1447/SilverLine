import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating coupons
const updateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(20, "Code too long").optional(),
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]).optional(),
  discountValue: z.number().positive("Discount value must be positive").optional(),
  minOrderValue: z.number().min(0, "Minimum order value cannot be negative").optional(),
  maxDiscount: z.number().positive("Max discount must be positive").optional(),
  usageLimit: z.number().int().positive("Usage limit must be positive").optional(),
  perUserLimit: z.number().int().positive("Per user limit must be positive").optional(),
  startsAt: z.string().optional(), // ISO date string
  expiresAt: z.string().optional(), // ISO date string
  isActive: z.boolean().optional(),
  applicableProducts: z.string().optional(), // comma-separated product IDs
  applicableCategories: z.string().optional(), // comma-separated category IDs
});

export async function GET(
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
    
    const couponId = parseInt(params.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json(
        { error: "Invalid coupon ID" },
        { status: 400 }
      );
    }
    
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    
    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
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
    
    const couponId = parseInt(params.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json(
        { error: "Invalid coupon ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateCouponSchema.parse(body);
    
    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    
    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }
    
    // Check if code is being changed and if it's already taken
    if (validatedData.code && validatedData.code !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code: validatedData.code },
      });
      
      if (duplicateCoupon) {
        return NextResponse.json(
          { error: "Coupon code already exists" },
          { status: 400 }
        );
      }
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
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    
    if (validatedData.code) {
      updateData.code = validatedData.code.toUpperCase();
    }
    
    if (validatedData.startsAt) {
      updateData.startsAt = new Date(validatedData.startsAt);
    }
    
    if (validatedData.expiresAt) {
      updateData.expiresAt = new Date(validatedData.expiresAt);
    }
    
    // Update coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    });
    
    return NextResponse.json({
      message: "Coupon updated successfully",
      coupon: {
        id: updatedCoupon.id,
        code: updatedCoupon.code,
        name: updatedCoupon.name,
        discountType: updatedCoupon.discountType,
        discountValue: parseFloat(updatedCoupon.discountValue.toString()),
        isActive: updatedCoupon.isActive,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    const couponId = parseInt(params.id);
    
    if (isNaN(couponId)) {
      return NextResponse.json(
        { error: "Invalid coupon ID" },
        { status: 400 }
      );
    }
    
    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    
    if (!existingCoupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }
    
    // Check if coupon has been used
    if (existingCoupon.usageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete coupon that has been used" },
        { status: 400 }
      );
    }
    
    // Delete coupon
    await prisma.coupon.delete({
      where: { id: couponId },
    });
    
    return NextResponse.json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
} 