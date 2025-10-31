import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = parseInt(session.user.id);
    
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
            _count: {
              select: {
                reviews: {
                  where: { isApproved: true }
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    
    const transformedItems = wishlistItems.map(item => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        shortDescription: item.product.shortDescription,
        price: parseFloat(item.product.price.toString()),
        image: item.product.images[0]?.url || "/placeholder.jpg",
        reviewCount: item.product._count.reviews,
        stock: item.product.stock,
        category: {
          id: item.product.category.id,
          name: item.product.category.name,
        },
      },
      addedAt: item.createdAt,
    }));
    
    return NextResponse.json({
      items: transformedItems,
      totalCount: transformedItems.length,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { productId } = body;
    
    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json(
        { error: "Valid product ID is required" },
        { status: 400 }
      );
    }
    
    const productIdInt = parseInt(productId);
    
    // Check if product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productIdInt },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    // Product is available if it exists
    
    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: productIdInt,
        },
      },
    });
    
    if (existingItem) {
      return NextResponse.json(
        { error: "Product is already in wishlist" },
        { status: 400 }
      );
    }
    
    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        productId: productIdInt,
      },
      include: {
        product: {
          include: {
            category: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });
    
    return NextResponse.json(
      { 
        message: "Product added to wishlist",
        item: {
          id: wishlistItem.id,
          product: {
            id: wishlistItem.product.id,
            name: wishlistItem.product.name,
            price: parseFloat(wishlistItem.product.price.toString()),
            image: wishlistItem.product.images[0]?.url || "/placeholder.jpg",
          },
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
} 