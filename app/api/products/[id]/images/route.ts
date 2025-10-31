import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for image operations
const imageSchema = z.object({
  url: z.string().url("Valid URL is required"),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching product images:", error);
    return NextResponse.json(
      { error: "Failed to fetch product images" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const validatedData = imageSchema.parse(body);
    
    // If this is a primary image, unset other primary images
    if (validatedData.isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    
    // Create new image
    const image = await prisma.productImage.create({
      data: {
        productId,
        url: validatedData.url,
        altText: validatedData.altText,
        isPrimary: validatedData.isPrimary,
        sortOrder: validatedData.sortOrder,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Image added successfully",
        image 
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
    
    console.error("Error adding product image:", error);
    return NextResponse.json(
      { error: "Failed to add product image" },
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
    
    const productId = parseInt(params.id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { images } = body; // Array of image updates
    
    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }
    
    // Update images in transaction
    await prisma.$transaction(async (tx) => {
      for (const imageUpdate of images) {
        const { id, ...updateData } = imageUpdate;
        
        // If setting as primary, unset other primary images first
        if (updateData.isPrimary) {
          await tx.productImage.updateMany({
            where: { productId },
            data: { isPrimary: false },
          });
        }
        
        // Update the image
        await tx.productImage.update({
          where: { id: parseInt(id) },
          data: updateData,
        });
      }
    });
    
    return NextResponse.json({
      message: "Images updated successfully",
    });
  } catch (error) {
    console.error("Error updating product images:", error);
    return NextResponse.json(
      { error: "Failed to update product images" },
      { status: 500 }
    );
  }
} 