import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth-crypto";
import { findUserById } from "@/lib/auth-db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lahore_dental_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    // Fetch user from DB to guarantee freshest role and state
    const dbUser = await findUserById(payload.id);
    if (!dbUser) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const safeUser = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role,
      created_at: dbUser.created_at,
    };

    return NextResponse.json({ authenticated: true, user: safeUser });
  } catch (err: any) {
    console.error("[auth/me error]:", err);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
