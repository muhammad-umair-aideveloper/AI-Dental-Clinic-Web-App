import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth-db";
import { verifyPassword, createSessionToken } from "@/lib/auth-crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    // Verify cryptographic salted password
    const isPasswordValid = verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    // Role check: Only clinic staff and surgeons can log in (patient accounts are forbidden)
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Access restricted: Patient accounts are retired. Only clinic staff can access this portal." },
        { status: 403 }
      );
    }

    // Generate signed session token with role from the database
    const token = createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: safeUser,
    });

    // Set persistent session cookie
    response.cookies.set({
      name: "lahore_dental_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("[auth/login error]:", err);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
