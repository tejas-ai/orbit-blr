import { NextResponse } from "next/server";
import { getRegisteredUserStats } from "@/lib/auth-db";

/**
 * Protected Registered User Statistics
 * Security: Requires x-orbit-stats-key or Authorization Bearer header matching ORBIT_API_SECRET.
 * Does NOT recreate retired public /admin routes.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("x-orbit-stats-key");
  const expectedSecret = process.env.ORBIT_API_SECRET;

  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!expectedSecret || !token || token !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized access to registered user statistics" },
      { status: 401 }
    );
  }

  try {
    const stats = await getRegisteredUserStats();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (err) {
    console.error("Error retrieving user statistics:", err);
    return NextResponse.json({ error: "Failed to query statistics" }, { status: 500 });
  }
}
