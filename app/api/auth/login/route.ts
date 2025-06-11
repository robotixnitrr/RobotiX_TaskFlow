import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // adjust to your actual path
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    console.log("Attempting login for:", email);

    // Look up user by email
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        position: users.position,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = userResult[0];

    // 🛡️ Optional: use bcrypt.compare here
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("Login successful for:", userWithoutPassword.email);

    const cookieValue = encodeURIComponent(JSON.stringify(userWithoutPassword));

    const response = new NextResponse(
      JSON.stringify({
        success: true,
        user: userWithoutPassword,
        message: "Login successful",
      }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `user=${cookieValue}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict`,
          "Content-Type": "application/json",
        },
      }
    );
    return response
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
