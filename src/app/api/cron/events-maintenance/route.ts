import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { archiveExpiredEvents } from "@/lib/event-archival";

export const dynamic = "force-dynamic";

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
 * Validates either Vercel's native CRON_SECRET or ORBIT_API_SECRET
 */
function isAuthorized(request: NextRequest): boolean {
  const authHeader =
    request.headers.get("authorization") || request.headers.get("x-orbit-cron-key");

  const cronSecret = process.env.CRON_SECRET;
  const apiSecret = process.env.ORBIT_API_SECRET;

  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  if (cronSecret && timingSafeCompare(token, cronSecret)) {
    return true;
  }

  if (apiSecret && timingSafeCompare(token, apiSecret)) {
    return true;
  }

  return false;
}

async function handleMaintenance(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron credentials." },
      { status: 401, headers: NO_CACHE_HEADERS }
    );
  }

  try {
    const report = await archiveExpiredEvents("hourly-maintenance-cron");
    return NextResponse.json(
      {
        success: true,
        service: "ORBIT-BLR-Maintenance-Engine",
        version: "3.3",
        report,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Maintenance cron error:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleMaintenance(request);
}

export async function POST(request: NextRequest) {
  return handleMaintenance(request);
}
