import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { updateEvent } from "@/lib/db";
import { PublicationStatus } from "@/types/event";

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { event_id, action, verification_notes } = await request.json();

    if (!event_id || !action) {
      return NextResponse.json(
        { success: false, error: "event_id and action ('approve' | 'reject' | 'archive') are required" },
        { status: 400 }
      );
    }

    let publication_status: PublicationStatus = "published";
    if (action === "approve") publication_status = "published";
    else if (action === "reject") publication_status = "archived";
    else if (action === "archive") publication_status = "archived";
    else if (action === "cancel") publication_status = "cancelled";

    const updated = await updateEvent(
      event_id,
      {
        publication_status,
        verification_notes: verification_notes || undefined,
        last_verified_at: new Date().toISOString(),
      },
      "admin_review"
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Event status updated to ${publication_status}`,
      event: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Review action failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
