import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getRegisteredUserStats } from "@/lib/auth-db";

export const dynamic = "force-dynamic";

/**
 * Constant-time comparison to prevent timing side-channel attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * Protected Registered User Statistics
 * Security: Requires x-orbit-stats-key or Authorization Bearer header matching ORBIT_STATS_SECRET (or ORBIT_API_SECRET as fallback).
 * This separates sensitive user metrics from automated event ingestion pipelines.
 * Does NOT recreate retired public /admin routes.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("x-orbit-stats-key");
  // Dedicated statistics secret takes precedence to enforce principle of least privilege
  const expectedSecret = process.env.ORBIT_STATS_SECRET || process.env.ORBIT_API_SECRET;

  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!expectedSecret || !token || !timingSafeCompare(token, expectedSecret)) {
    return NextResponse.json(
      { error: "Unauthorized access to registered user statistics" },
      {
        status: 401,
        headers: NO_CACHE_HEADERS,
      }
    );
  }

  try {
    const stats = await getRegisteredUserStats();
    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        stats,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (err) {
    console.error("Error retrieving user statistics:", err);
    return NextResponse.json(
      { error: "Failed to query statistics" },
      {
        status: 500,
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}
