import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// In-memory user storage (in production, use a real database)
const users: Array<{
  id: string;
  email: string;
  password: string;
  name: string;
  createdDate: Date;
}> = [
  {
    id: "user_demo_1",
    email: "demo@nvoice.com",
    password: "demo_hashed_password_123", // Pre-hashed demo password
    name: "Demo User",
    createdDate: new Date(),
  },
];

// Simple hash function for password verification
function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  // For demo user, accept the demo password
  if (hashedPassword === "demo_hashed_password_123") {
    return password === "demo123";
  }
  
  // For other users, verify using the stored hash and salt
  const [hash, salt] = hashedPassword.split(":") || [hashedPassword];
  if (!salt) return false;
  
  const passwordHash = hashPassword(password, salt);
  return passwordHash === hash;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Store sessions in memory (in production, use a database)
const sessions = new Map<
  string,
  {
    userId: string;
    token: string;
    createdAt: Date;
    expiresAt: Date;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const token = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    sessions.set(token, {
      userId: user.id,
      token,
      createdAt: now,
      expiresAt,
    });

    // Return success response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdDate: user.createdDate,
        },
        token,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export { sessions, users };
