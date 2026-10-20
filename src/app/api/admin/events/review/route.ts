import { NextResponse } from "next/server";

/**
 * RETIRED ENDPOINT — ORBIT BLR 3.0+
 * All /admin and /api/admin/* endpoints are permanently retired.
 * Direct requests return 404 Not Found (double-layer protection with middleware).
 */
export async function POST() {
  return new NextResponse("Not Found", { status: 404, statusText: "Not Found" });
}

export async function GET() {
  return new NextResponse("Not Found", { status: 404, statusText: "Not Found" });
}
