import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { updateEvent, getEventById } from "@/lib/db";
import { OrbitEvent } from "@/types/event";

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      event_id,
      registration_status,
      registration_url,
      goodies_status,
      goodies_details,
      certificate_status,
      certificate_requirements,
      food_status,
      food_details,
      verification_notes,
    } = body;

    if (!event_id) {
      return NextResponse.json({ success: false, error: "event_id is required" }, { status: 400 });
    }

    const existing = await getEventById(event_id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const updates: Partial<OrbitEvent> = {
      last_verified_at: new Date().toISOString(),
    };

    if (registration_status) updates.registration_status = registration_status;
    if (registration_url) updates.registration_url = registration_url;
    if (goodies_status) updates.goodies_status = goodies_status;
    if (goodies_details !== undefined) updates.goodies_details = goodies_details;
    if (certificate_status) updates.certificate_status = certificate_status;
    if (certificate_requirements !== undefined) updates.certificate_requirements = certificate_requirements;
    if (food_status) updates.food_status = food_status;
    if (food_details !== undefined) updates.food_details = food_details;
    if (verification_notes !== undefined) updates.verification_notes = verification_notes;

    const updated = await updateEvent(event_id, updates, "admin_status_update");

    return NextResponse.json({
      success: true,
      message: "Event status and benefits updated successfully",
      event: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Status update failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
