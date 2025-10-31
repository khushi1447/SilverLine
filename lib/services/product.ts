import { prisma } from "@/lib/db";

export interface ProductWithDetails {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  category: {
    id: number;
    name: string;
  };
  weight?: number;
  size?: string;
  images: Array<{
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  reviews: Array<{
    id: number;
    rating: number;
    title: string;
    comment: string;
    isVerified: boolean;
    helpfulCount: number;
    user: {
      firstName: string;
      lastName: string;
    };
    createdAt: Date;
  }>;
  stats: {
    reviewCount: number;
    wishlistCount: number;
    averageRating: number;
  };
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getProductById(id: number): Promise<ProductWithDetails | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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
      return null;
    }

    // Calculate average rating
    const reviews = product.reviews;
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const transformedProduct: ProductWithDetails = {
      id: product.id.toString(),
      name: product.name,
      description: product.description || "",
      shortDescription: product.shortDescription || undefined,
      price: parseFloat(product.price.toString()),
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      weight: product.weight ? parseFloat(product.weight.toString()) : undefined,
      size: product.size || undefined,
      images: product.images.map(img => ({
        id: img.id.toString(),
        url: img.url,
        altText: img.altText || undefined,
        isPrimary: img.isPrimary,
      })),
      reviews: product.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title || '',
        comment: review.comment || '',
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
      reviewCount: product._count.reviews,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return transformedProduct;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}
