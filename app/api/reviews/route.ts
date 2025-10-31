import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for creating reviews
const createReviewSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment too long"),
  // For non-logged in users
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);
    
    const { productId, rating, title, comment, firstName, lastName, email } = validatedData;

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
    
    if (session?.user?.id) {
      // Logged in user
      const userId = parseInt(session.user.id);

      // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
            productId,
          },
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }
    
      // Create review for logged in user
      const review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          title,
          comment,
          isVerified: true, // Assume verified for logged in users
          isApproved: false, // Requires admin approval
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Review submitted successfully",
        review: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerified: review.isVerified,
          user: {
            firstName: review.user.firstName,
            lastName: review.user.lastName,
          },
          createdAt: review.createdAt,
        },
      });
    } else {
      // Non-logged in user - create with provided details
      if (!firstName || !lastName || !email) {
        return NextResponse.json(
          { error: "Name and email are required for guest reviews" },
          { status: 400 }
        );
      }

      // For guest users, we'll create a temporary user or handle differently
      // For now, let's create a review without userId (we'll need to modify the schema)
      // Actually, let's create a guest user entry
      let guestUser = await prisma.user.findFirst({
        where: {
          email,
          firstName,
          lastName,
        },
      });

      if (!guestUser) {
        // Create a guest user
        guestUser = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: "guest", // Temporary password for guest users
          },
        });
      }

      // Check if this guest user already reviewed this product
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_productId: {
            userId: guestUser.id,
            productId,
        },
      },
    });
    
      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 }
        );
      }

      // Create review for guest user
    const review = await prisma.review.create({
      data: {
          userId: guestUser.id,
          productId,
          rating,
          title,
          comment,
          isVerified: false, // Not verified for guest users
        isApproved: false, // Requires admin approval
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
      return NextResponse.json({
        message: "Review submitted successfully",
        review: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerified: review.isVerified,
          user: {
            firstName: review.user.firstName,
            lastName: review.user.lastName,
          },
          createdAt: review.createdAt,
          },
      });
        }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
} 