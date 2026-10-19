import { NextRequest, NextResponse } from "next/server";
import { isValidAdminPassword, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || !isValidAdminPassword(password)) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Authentication successful" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Auth error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  const isValid = Boolean(session && isValidAdminPassword(session.value));

  return NextResponse.json({ authenticated: isValid });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
