import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth-db";
import { verifyPassword, createSessionToken } from "@/lib/auth-crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const normalizedInput = (email || "").trim().toLowerCase();
    const normalizedPassword = (password || "").trim();

    if (!normalizedInput || !normalizedPassword) {
      return NextResponse.json(
        { error: "Username/email and password are required." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(normalizedInput);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin credentials required." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(normalizedPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your password." },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: "admin",
        username: "admin",
        name: user.name,
      },
    });

    response.cookies.set({
      name: "lahore_dental_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 500 });
  }
}
