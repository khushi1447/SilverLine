import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get all products with basic info
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    // Get total count
    const totalCount = await prisma.product.count();

    return NextResponse.json({
      totalCount,
      products,
      message: "Debug: Product list retrieved successfully",
    });
  } catch (error) {
    console.error("Debug: Error fetching products:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
