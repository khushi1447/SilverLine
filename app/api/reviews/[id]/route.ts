import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating reviews
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1, "Title is required").max(100, "Title too long").optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment too long").optional(),
  isApproved: z.boolean().optional(),
  adminReply: z.string().max(500, "Admin reply too long").optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = parseInt(params.id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }
    
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isVerified: review.isVerified,
      isApproved: review.isApproved,
      helpfulCount: review.helpfulCount,
      adminReply: review.adminReply,
      user: {
        id: review.user.id,
        name: `${review.user.firstName} ${review.user.lastName}`,
      },
      product: {
        id: review.product.id,
        name: review.product.name,
      },
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const reviewId = parseInt(params.id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateReviewSchema.parse(body);
    
    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    
    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.isAdmin || false;
    
    // Check if user can update this review
    if (!isAdmin && existingReview.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only admins can update approval status and admin reply
    if (!isAdmin) {
      delete validatedData.isApproved;
      delete validatedData.adminReply;
    }
    
    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: "Review updated successfully",
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title,
        comment: updatedReview.comment,
        isVerified: updatedReview.isVerified,
        isApproved: updatedReview.isApproved,
        helpfulCount: updatedReview.helpfulCount,
        adminReply: updatedReview.adminReply,
        user: {
          id: updatedReview.user.id,
          name: `${updatedReview.user.firstName} ${updatedReview.user.lastName}`,
        },
        product: {
          id: updatedReview.product.id,
          name: updatedReview.product.name,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const reviewId = parseInt(params.id);
    
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }
    
    // Get existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    
    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }
    
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.isAdmin || false;
    
    // Check if user can delete this review
    if (!isAdmin && existingReview.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });
    
    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
} 