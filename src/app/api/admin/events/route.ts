import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { getAllEvents, createEvent } from "@/lib/db";
import { OrbitEvent } from "@/types/event";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const events = getAllEvents({ includeUnpublished: true });

  return NextResponse.json({
    success: true,
    count: events.length,
    events,
  });
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data: Partial<OrbitEvent> = await request.json();

    if (!data.name || !data.registration_url) {
      return NextResponse.json(
        { success: false, error: "Event name and registration_url are required" },
        { status: 400 }
      );
    }

    const created = createEvent(data, "admin_portal");

    return NextResponse.json({
      success: true,
      event: created,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Creation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
