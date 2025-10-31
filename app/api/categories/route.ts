import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for categories
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url("Valid URL is required").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";
    const includeCounts = searchParams.get("includeCounts") === "true";
    
    const categories = await prisma.category.findMany({
      include: {
        _count: includeCounts ? {
          select: { products: true },
        } : undefined,
        ...(includeProducts && {
          products: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
            take: 6, // Limit products per category
          },
        }),
      },
      orderBy: { name: "asc" },
    });
    
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category._count?.products || 0,
      products: (category as any).products?.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.toString()),
        image: product.images[0]?.url || "/placeholder.jpg",
      })) || [],
    }));
    
    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = categorySchema.parse(body);
    
    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Category created successfully",
        category 
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
    
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
} 