import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Image schema for product images
const imageSchema = z.object({
  url: z.string().min(1, "Image URL is required").refine(
    (url) => {
      // Accept both absolute URLs and relative paths starting with /
      return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')
    },
    "Image URL must be a valid absolute URL or relative path starting with /"
  ),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
})

// Validation schema for updating products
const updateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  stock: z.number().int().min(0, "Stock must be non-negative").optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  categoryId: z.number().int().positive("Category is required").optional(),
  weight: z.number().positive().optional(),
  size: z.string().optional(),
  images: z.array(imageSchema).min(0, "Images required").max(10, "Maximum 10 images allowed").optional(),
});

// Helper function to check admin authentication
async function checkAdminAuth() {
  // First try NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user?.isAdmin) {
    return true;
  }

  // Fallback to JWT admin token
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-token")?.value;
    
    if (adminToken) {
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET || "your-secret-key") as any;
      return decoded.role === "admin";
    }
  } catch (error) {
    console.error("JWT verification error:", error);
  }

  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            reviews: {
              where: { isApproved: true }
            },
            wishlistItems: true,
          },
        },
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin or product has stock
    const session = await getServerSession();
    if (!session?.user?.isAdmin && product.stock <= 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Calculate average rating
    const reviews = product.reviews;
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: parseFloat(product.price.toString()),
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      weight: product.weight ? parseFloat(product.weight.toString()) : null,
      size: product.size,
      images: product.images.map(img => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
      reviews: product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        isVerified: review.isVerified,
        helpfulCount: review.helpfulCount,
        user: {
          firstName: review.user.firstName,
          lastName: review.user.lastName,
        },
        createdAt: review.createdAt,
      })),
      stats: {
        reviewCount: product._count.reviews,
        wishlistCount: product._count.wishlistItems,
        averageRating,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    
    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Check if product name is being changed and if it already exists in the same category
    if (validatedData.name && validatedData.name !== existingProduct.name) {
      const nameExists = await prisma.product.findFirst({
        where: { 
          name: validatedData.name,
          categoryId: validatedData.categoryId || existingProduct.categoryId,
          id: { not: productId }
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { error: "Product with this name already exists in this category" },
          { status: 400 }
        );
      }
    }
    
    // Update product with images in a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Prepare product data (exclude images)
      const { images, ...productData } = validatedData;
      
      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: productData,
      });

      // Handle image updates if provided
      if (images !== undefined) {
        // Delete existing images
        await tx.productImage.deleteMany({
          where: { productId: productId }
        });

        // Create new images if any
        if (images.length > 0) {
          const imageData = images.map((image, index) => ({
            productId: productId,
            url: image.url,
            altText: image.altText || `${updatedProduct.name} - Image ${index + 1}`,
            isPrimary: image.isPrimary,
            sortOrder: index,
          }));

          await tx.productImage.createMany({
            data: imageData,
          });
        }
      }

      // Return product with images
      return tx.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' }
          },
        },
      });
    });
    
    return NextResponse.json({
      message: "Product updated successfully",
      product: {
        id: updatedProduct?.id,
        name: updatedProduct?.name,
        price: updatedProduct ? parseFloat(updatedProduct.price.toString()) : 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Delete related records first (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete order items
      await tx.orderItem.deleteMany({
        where: { productId: productId }
      });
      
      // Delete reviews
      await tx.review.deleteMany({
        where: { productId: productId }
      });
      
      // Delete wishlist items
      await tx.wishlistItem.deleteMany({
        where: { productId: productId }
      });
      
      // Delete cart items
      await tx.cartItem.deleteMany({
        where: { productId: productId }
      });
      
      // Delete product images (these have cascade delete but let's be explicit)
      await tx.productImage.deleteMany({
        where: { productId: productId }
      });
      
      // Finally delete the product
      await tx.product.delete({
        where: { id: productId }
      });
    });
    
    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
} 