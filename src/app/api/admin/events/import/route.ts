import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { upsertEventsBatch } from "@/lib/db";
import { OrbitEvent } from "@/types/event";

export async function POST(request: NextRequest) {
  // 1. Authenticate Request
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized: Valid Bearer token or admin session required.",
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Support either `{ events: [...] }` or a direct array `[...]`
    let rawEvents: Partial<OrbitEvent>[] = [];
    if (Array.isArray(body)) {
      rawEvents = body;
    } else if (body && Array.isArray(body.events)) {
      rawEvents = body.events;
    } else if (body && typeof body === "object") {
      // Single event payload
      rawEvents = [body];
    }

    if (rawEvents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty payload: Expected an array of events or an object with an 'events' array.",
        },
        { status: 400 }
      );
    }

    // Determine actor from auth
    const authHeader = request.headers.get("authorization");
    const actor = authHeader?.includes("Bearer") ? "external_ai_api" : "admin_dashboard";

    // 2. Perform Idempotent Upsert & Deduplication Batch
    const result = upsertEventsBatch(rawEvents, actor);

    return NextResponse.json({
      success: true,
      message: `Processed ${rawEvents.length} event records successfully.`,
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to import events";
    return NextResponse.json(
      {
        success: false,
        error: `Import processing error: ${msg}`,
      },
      { status: 500 }
    );
  }
}
