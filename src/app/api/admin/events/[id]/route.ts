import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
import { OrbitEvent } from "@/types/event";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, event });
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const data: Partial<OrbitEvent> = await request.json();
    const updated = await updateEvent(id, data, "admin_editor");

    if (!updated) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const isAuthorized = await verifyAdminAuth(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await deleteEvent(id, "admin_deletion");

  if (!success) {
    return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Event deleted successfully" });
}
