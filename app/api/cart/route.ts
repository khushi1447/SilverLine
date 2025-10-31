import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get user's cart items with product details
    const cartItems = await prisma.cartItem.findMany({
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

    // Transform cart items to match frontend interface
    const items = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      product: {
        name: item.product.name,
        images: item.product.images.length > 0 ? item.product.images : [{ url: "/placeholder.svg", isPrimary: true }],
      },
      price: parseFloat(item.product.price.toString()),
      quantity: item.quantity,
      stock: item.product.stock,
    }));

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return NextResponse.json({
      items,
      totalItems,
      total: subtotal,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { items } = body;

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    // Add new cart items
    if (items && items.length > 0) {
      const cartItems = items.map((item: any) => ({
        userId,
        productId: item.productId,
        quantity: item.quantity,
      }));

      await prisma.cartItem.createMany({
        data: cartItems,
      });
    }

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
} 