import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for settings
const settingSchema = z.object({
  category: z.string().min(1, "Category is required"),
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
  dataType: z.enum(["string", "number", "boolean", "json"]).default("string"),
  isPublic: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get("category");
    const isPublic = searchParams.get("public");
    
    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    // Non-admin users can only see public settings
    if (!session?.user?.isAdmin) {
      where.isPublic = true;
    } else if (isPublic !== null) {
      where.isPublic = isPublic === "true";
    }
    
    const settings = await prisma.setting.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { key: "asc" },
      ],
    });
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        description: setting.description,
        dataType: setting.dataType,
        isPublic: setting.isPublic,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    return NextResponse.json({
      settings: groupedSettings,
      categories: Object.keys(groupedSettings),
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = settingSchema.parse(body);
    
    // Check if setting already exists
    const existingSetting = await prisma.setting.findUnique({
      where: { key: validatedData.key },
    });
    
    if (existingSetting) {
      return NextResponse.json(
        { error: "Setting key already exists" },
        { status: 400 }
      );
    }
    
    // Create setting
    const setting = await prisma.setting.create({
      data: {
        category: validatedData.category,
        key: validatedData.key,
        value: validatedData.value,
        description: validatedData.description,
        dataType: validatedData.dataType,
        isPublic: validatedData.isPublic,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Setting created successfully",
        setting: {
          id: setting.id,
          key: setting.key,
          value: setting.value,
          category: setting.category,
        }
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
    
    console.error("Error creating setting:", error);
    return NextResponse.json(
      { error: "Failed to create setting" },
      { status: 500 }
    );
  }
} 