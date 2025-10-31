import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for coupon validation
const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().positive("Subtotal must be positive"),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateCouponSchema.parse(body);
    
    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: validatedData.code },
    });
    
    if (!coupon) {
      return NextResponse.json({
        isValid: false,
        error: "Invalid coupon code",
      });
    }
    
    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        isValid: false,
        error: "Coupon is not active",
      });
    }
    
    // Check validity dates
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({
        isValid: false,
        error: "Coupon is not yet active",
      });
    }
    
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({
        isValid: false,
        error: "Coupon has expired",
      });
    }
    
    // Check minimum order value
    if (validatedData.subtotal < parseFloat(coupon.minOrderValue.toString())) {
      return NextResponse.json({
        isValid: false,
        error: `Minimum order value is $${parseFloat(coupon.minOrderValue.toString())}`,
      });
    }
    
    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({
        isValid: false,
        error: "Coupon usage limit reached",
      });
    }
    
    // Check per-user limit (if user is authenticated)
    const session = await getServerSession();
    if (session?.user?.id && coupon.perUserLimit) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId: parseInt(session.user.id),
          couponId: coupon.id,
        },
      });
      
      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json({
          isValid: false,
          error: "You have already used this coupon maximum times",
        });
      }
    }
    
    // Check applicable products/categories
    if (validatedData.items && (coupon.applicableProducts || coupon.applicableCategories)) {
      const productIds = validatedData.items.map(item => item.productId);
      
      // Check if any products are applicable
      let hasApplicableProducts = false;
      
      if (coupon.applicableProducts) {
        const applicableProductIds = coupon.applicableProducts.split(",").map(id => parseInt(id.trim()));
        hasApplicableProducts = productIds.some(id => applicableProductIds.includes(id));
      }
      
      if (coupon.applicableCategories) {
        const applicableCategoryIds = coupon.applicableCategories.split(",").map(id => parseInt(id.trim()));
        const productsInCategories = await prisma.product.findMany({
          where: {
            id: { in: productIds },
            categoryId: { in: applicableCategoryIds },
          },
        });
        hasApplicableProducts = hasApplicableProducts || productsInCategories.length > 0;
      }
      
      if (!hasApplicableProducts) {
        return NextResponse.json({
          isValid: false,
          error: "Coupon is not applicable to items in your cart",
        });
      }
    }
    
    // Calculate discount
    let discountAmount = 0;
    let discountType = coupon.discountType;
    
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (validatedData.subtotal * parseFloat(coupon.discountValue.toString())) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount.toString()));
      }
    } else if (coupon.discountType === "FIXED_AMOUNT") {
      discountAmount = parseFloat(coupon.discountValue.toString());
    } else if (coupon.discountType === "FREE_SHIPPING") {
      discountAmount = 0; // Will be applied to shipping cost
    }
    
    return NextResponse.json({
      isValid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue.toString()),
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount.toString()) : null,
        discountAmount,
        minOrderValue: parseFloat(coupon.minOrderValue.toString()),
        usageLimit: coupon.usageLimit,
        usageCount: coupon.usageCount,
        perUserLimit: coupon.perUserLimit,
        startsAt: coupon.startsAt,
        expiresAt: coupon.expiresAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
} 