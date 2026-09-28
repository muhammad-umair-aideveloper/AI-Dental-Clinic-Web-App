import { NextResponse } from "next/server";
import { createUser } from "@/lib/auth-db";
import { createSessionToken } from "@/lib/auth-crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const trimmedName = (name || "").trim() || email.split("@")[0];

    // createUser automatically sets role: "user"
    const result = await createUser({
      name: trimmedName,
      email,
      phone: phone || "",
      password,
      role: "user", // Normal users must be assigned the user role automatically
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || "Failed to create account." },
        { status: 400 }
      );
    }

    // Generate signed session token
    const token = createSessionToken({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone,
      role: result.user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: result.user,
    });

    // Set persistent HTTP-only cookie
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
    console.error("[auth/signup error]:", err);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
