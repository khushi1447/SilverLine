import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "US";
    const weight = parseFloat(searchParams.get("weight") || "0");
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");
    
    // Define shipping methods based on country and order value
    const shippingMethods = [
      {
        id: "standard",
        name: "Standard Shipping",
        method: "STANDARD",
        description: "5-7 business days",
        cost: country === "US" ? (subtotal > 100 ? 0 : 8.99) : 15.99,
        estimatedDays: "5-7",
        isAvailable: true,
      },
      {
        id: "express",
        name: "Express Shipping",
        method: "EXPRESS",
        description: "2-3 business days",
        cost: country === "US" ? (subtotal > 100 ? 4.99 : 12.99) : 25.99,
        estimatedDays: "2-3",
        isAvailable: true,
      },
      {
        id: "overnight",
        name: "Overnight Shipping",
        method: "OVERNIGHT",
        description: "Next business day",
        cost: country === "US" ? (subtotal > 100 ? 9.99 : 19.99) : 45.99,
        estimatedDays: "1",
        isAvailable: country === "US", // Only available in US
      },
      {
        id: "free",
        name: "Free Shipping",
        method: "FREE",
        description: "Free on orders over ₹100",
        cost: 0,
        estimatedDays: "5-7",
        isAvailable: subtotal >= 100,
      },
    ];
    
    // Filter available methods
    const availableMethods = shippingMethods.filter(method => method.isAvailable);
    
    return NextResponse.json({
      methods: availableMethods,
      currency: "USD",
      country,
    });
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping methods" },
      { status: 500 }
    );
  }
} 