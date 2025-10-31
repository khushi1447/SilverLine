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

// Validation schema for creating products
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  lowStockThreshold: z.number().int().min(0).default(5),
  categoryId: z.number().int().positive("Category is required"),
  weight: z.number().positive().optional(),
  size: z.string().optional(),
  images: z.array(imageSchema).min(3, "Minimum 3 images required").max(10, "Maximum 10 images allowed"),
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
      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(adminToken, jwtSecret) as any;
      console.log("JWT decoded:", decoded);
      return decoded.role === "admin";
    }
  } catch (error) {
    console.error("JWT verification error:", error);
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;
    
    // Search and filter parameters
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // Build where clause
    const where: any = {};
    
    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
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
    
    // Stock filter (only show products with stock > 0 for non-admin users)
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      where.stock = { gt: 0 };
    }
    
    // Build order by clause - validate sortBy field
    const validSortFields = ['id', 'name', 'price', 'stock', 'createdAt', 'updatedAt'];
    const orderBy: any = {};
    
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      // Default to createdAt if invalid sort field
      orderBy.createdAt = sortOrder;
    }
    
    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
          _count: {
            select: {
              reviews: {
                where: { isApproved: true }
              },
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
    const transformedProducts = products.map((product: any) => ({
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
      images: product.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isPrimary: img.isPrimary,
      })),
      reviewCount: product._count.reviews,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
    
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
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/products - Starting request");
    const isAdmin = await checkAdminAuth();
    console.log("Admin check result:", isAdmin);
    
    if (!isAdmin) {
      console.log("Unauthorized access attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log("Received product data:", JSON.stringify(body, null, 2));
    
    let validatedData;
    try {
      validatedData = createProductSchema.parse(body);
      console.log("Validation successful:", validatedData);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: "Validation failed", 
            details: validationError.errors 
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    // Check if product with same name already exists
    const existingProduct = await prisma.product.findFirst({
      where: { 
        name: validatedData.name,
        categoryId: validatedData.categoryId
      },
    });
    
    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this name already exists in this category" },
        { status: 400 }
      );
    }
    
    // Create product with images in a transaction
    console.log("Starting database transaction...");
    let product;
    try {
      product = await prisma.$transaction(async (tx) => {
        // Create the product
        console.log("Creating product...");
        const newProduct = await tx.product.create({
          data: {
            name: validatedData.name,
            description: validatedData.description,
            shortDescription: validatedData.shortDescription,
            price: validatedData.price,
            stock: validatedData.stock,
            lowStockThreshold: validatedData.lowStockThreshold,
            categoryId: validatedData.categoryId,
            weight: validatedData.weight,
            size: validatedData.size,
          },
        })
        console.log("Product created with ID:", newProduct.id);

        // Create images if provided
        if (validatedData.images && validatedData.images.length > 0) {
          console.log("Creating images...");
          const imageData = validatedData.images.map((image, index) => ({
            productId: newProduct.id,
            url: image.url,
            altText: image.altText || `${validatedData.name} - Image ${index + 1}`,
            isPrimary: index === 0, // First image is primary
            sortOrder: index,
          }))

          await tx.productImage.createMany({
            data: imageData,
          })
          console.log("Images created successfully");
        }

        // Return product with images
        return tx.product.findUnique({
          where: { id: newProduct.id },
          include: {
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' }
            },
          },
        })
      })
      console.log("Transaction completed successfully");
    } catch (dbError) {
      console.error("Database transaction error:", dbError);
      return NextResponse.json(
        { 
          error: "Failed to create product", 
          details: dbError instanceof Error ? dbError.message : "Unknown database error"
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        message: "Product created successfully",
        product: {
          id: product?.id,
          name: product?.name,
          price: product ? parseFloat(product.price.toString()) : 0,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
} 