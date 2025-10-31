import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // For demo purposes, using hardcoded admin credentials
    // In production, this should check against a secure admin user database
    const adminCredentials = {
      email: "admin@jewelry-store.com",
      password: "admin123", // In production, this should be hashed
    };

    if (email !== adminCredentials.email || password !== adminCredentials.password) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        adminId: "admin-1", 
        email: adminCredentials.email, 
        role: "admin" 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "8h" }
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return NextResponse.json(
      { 
        message: "Login successful",
        user: {
          email: adminCredentials.email,
          role: "admin",
          name: "Admin User"
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}