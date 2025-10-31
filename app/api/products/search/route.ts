import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Search parameters
    const query = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minWeight = searchParams.get("minWeight");
    const maxWeight = searchParams.get("maxWeight");
    const size = searchParams.get("size");
    const certification = searchParams.get("certification");
    const inStock = searchParams.get("inStock");
    const onSale = searchParams.get("onSale");
    
    // Sorting and pagination
    const sortBy = searchParams.get("sortBy") || "relevance";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      status: "active",
    };
    
    // Text search across multiple fields
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ];
    }
    
    // Category filter
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    // Weight range filter
    if (minWeight || maxWeight) {
      where.weight = {};
      if (minWeight) where.weight.gte = parseFloat(minWeight);
      if (maxWeight) where.weight.lte = parseFloat(maxWeight);
    }
    
    // Size filter
    if (size) {
      where.size = { contains: size, mode: "insensitive" };
    }
    
    // Certification filter
    if (certification) {
      where.certification = { contains: certification, mode: "insensitive" };
    }
    
    // Stock filter
    if (inStock === "true") {
      where.stock = { gt: 0 };
    } else if (inStock === "false") {
      where.stock = { equals: 0 };
    }
    
    // Sale filter (products with compare price)
    if (onSale === "true") {
      where.comparePrice = { not: null };
    }
    
    // Build order by clause based on sort type
    let orderBy: any = {};
    
    switch (sortBy) {
      case "price":
        orderBy.price = sortOrder;
        break;
      case "name":
        orderBy.name = sortOrder;
        break;
      case "newest":
        orderBy.createdAt = sortOrder;
        break;
      case "popularity":
        orderBy = {
          reviews: {
            _count: sortOrder,
          },
        };
        break;
      case "relevance":
      default:
        // For relevance, we'll use text search ranking if available
        // For now, fall back to creation date
        orderBy.createdAt = "desc";
        break;
    }
    
    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
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
              wishlistItems: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    
    // Transform products for response
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: parseFloat(product.price.toString()),
      stock: product.stock,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      weight: product.weight ? parseFloat(product.weight.toString()) : null,
      size: product.size,
      image: product.images[0]?.url || "/placeholder.jpg",
      stats: {
        reviewCount: product._count.reviews,
        wishlistCount: product._count.wishlistItems,
      },
      isOnSale: false,
      discountPercentage: 0,
    }));
    
    // Get filter options for UI
    const filterOptions = await getFilterOptions(where);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: filterOptions,
      searchQuery: query,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}

async function getFilterOptions(baseWhere: any) {
  try {
    // Get price range
    const priceStats = await prisma.product.aggregate({
      where: { ...baseWhere, price: { not: null } },
      _min: { price: true },
      _max: { price: true },
    });
    
    // Get weight range
    const weightStats = await prisma.product.aggregate({
      where: { ...baseWhere, weight: { not: null } },
      _min: { weight: true },
      _max: { weight: true },
    });
    
    // Get categories
    const categories = await prisma.category.findMany({
      where: {
        products: {
          some: baseWhere,
        },
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    // Get sizes
    const sizes = await prisma.product.findMany({
      where: { ...baseWhere, size: { not: null } },
      select: { size: true },
      distinct: ["size"],
    });
    
    // Get certifications - disabled as certification field doesn't exist
    const certifications: any[] = [];
    
    return {
      priceRange: {
        min: priceStats._min.price ? parseFloat(priceStats._min.price.toString()) : 0,
        max: priceStats._max.price ? parseFloat(priceStats._max.price.toString()) : 0,
      },
      weightRange: {
        min: weightStats._min.weight ? parseFloat(weightStats._min.weight.toString()) : 0,
        max: weightStats._max.weight ? parseFloat(weightStats._max.weight.toString()) : 0,
      },
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.products,
      })),
      sizes: sizes.map(item => item.size).filter(Boolean),
      certifications: [],
    };
  } catch (error) {
    console.error("Error getting filter options:", error);
    return {
      priceRange: { min: 0, max: 0 },
      weightRange: { min: 0, max: 0 },
      categories: [],
      sizes: [],
      certifications: [],
    };
  }
} 