import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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
    const { guestCart } = body;

    if (!guestCart || !Array.isArray(guestCart)) {
      return NextResponse.json(
        { error: "Invalid guest cart data" },
        { status: 400 }
      );
    }

    // Get existing user cart items
    const existingCartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    // Create a map of existing items for quick lookup
    const existingItemsMap = new Map(
      existingCartItems.map(item => [item.productId, item])
    );

    // Process guest cart items
    for (const guestItem of guestCart) {
      const existingItem = existingItemsMap.get(guestItem.productId);

      if (existingItem) {
        // Update quantity if item already exists
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + guestItem.quantity,
          },
        });
      } else {
        // Add new item to cart
        await prisma.cartItem.create({
          data: {
            userId,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          },
        });
      }
    }

    // Get updated cart
    const updatedCartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    const items = updatedCartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: parseFloat(item.product.price.toString()),
      image: item.product.images[0]?.url || "/placeholder.jpg",
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      message: "Cart merged successfully",
      items,
      totalItems,
      subtotal,
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    return NextResponse.json(
      { error: "Failed to merge cart" },
      { status: 500 }
    );
  }
} 