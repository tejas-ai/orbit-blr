import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserSavedEvents, mergeUserSavedEvents, toggleUserSavedEvent } from "@/lib/auth-db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const savedIds = await getUserSavedEvents(session.user.id);
  return NextResponse.json({ savedIds });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 1. Merge local bookmarks after sign-in
    if (Array.isArray(body.localIds)) {
      const merged = await mergeUserSavedEvents(session.user.id, body.localIds);
      return NextResponse.json({ savedIds: merged });
    }

    // 2. Toggle specific event bookmark
    if (body.eventId) {
      const result = await toggleUserSavedEvent(session.user.id, String(body.eventId));
      return NextResponse.json({ saved: result.saved, savedIds: result.ids });
    }

    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  } catch (err) {
    console.error("Error processing saved events:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
