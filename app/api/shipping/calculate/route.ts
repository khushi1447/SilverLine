import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for shipping calculation
const calculateShippingSchema = z.object({
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    weight: z.number().optional(),
  })).min(1, "At least one item is required"),
  shippingAddress: z.object({
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    postalCode: z.string().min(1, "Postal code is required"),
  }),
  subtotal: z.number().positive("Subtotal must be positive"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculateShippingSchema.parse(body);
    
    const { items, shippingAddress, subtotal } = validatedData;
    
    // Calculate total weight (if available)
    const totalWeight = items.reduce((sum, item) => {
      return sum + ((item.weight || 0.1) * item.quantity); // Default weight 0.1kg
    }, 0);
    
    // Define shipping rates based on country and order value
    const country = shippingAddress.country.toUpperCase();
    const isUS = country === "US";
    const isInternational = !isUS;
    
    // Base shipping rates
    let standardRate = 8.99;
    let expressRate = 12.99;
    let overnightRate = 19.99;
    
    // Adjust rates for international shipping
    if (isInternational) {
      standardRate = 15.99;
      expressRate = 25.99;
      overnightRate = 45.99;
    }
    
    // Apply free shipping for orders over ₹100
    if (subtotal >= 100) {
      standardRate = 0;
      expressRate = 4.99;
      overnightRate = 9.99;
    }
    
    // Weight-based adjustments
    if (totalWeight > 2) {
      standardRate += (totalWeight - 2) * 2;
      expressRate += (totalWeight - 2) * 3;
      overnightRate += (totalWeight - 2) * 4;
    }
    
    // Regional adjustments
    if (isUS) {
      // Alaska and Hawaii
      if (["AK", "HI"].includes(shippingAddress.state.toUpperCase())) {
        standardRate += 5;
        expressRate += 8;
        overnightRate += 12;
      }
    }
    
    const shippingOptions = [
      {
        method: "STANDARD",
        name: "Standard Shipping",
        description: "5-7 business days",
        cost: standardRate,
        estimatedDays: "5-7",
        isAvailable: true,
      },
      {
        method: "EXPRESS",
        name: "Express Shipping",
        description: "2-3 business days",
        cost: expressRate,
        estimatedDays: "2-3",
        isAvailable: true,
      },
      {
        method: "OVERNIGHT",
        name: "Overnight Shipping",
        description: "Next business day",
        cost: overnightRate,
        estimatedDays: "1",
        isAvailable: isUS, // Only available in US
      },
      {
        method: "FREE",
        name: "Free Shipping",
        description: "Free on orders over ₹100",
        cost: 0,
        estimatedDays: "5-7",
        isAvailable: subtotal >= 100,
      },
    ];
    
    // Filter available methods
    const availableMethods = shippingOptions.filter(method => method.isAvailable);
    
    return NextResponse.json({
      methods: availableMethods,
      calculation: {
        totalWeight,
        itemCount: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        country,
        isInternational,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error calculating shipping:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
} 