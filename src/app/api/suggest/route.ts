import { NextRequest, NextResponse } from "next/server";
import { createSuggestion } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_url, event_name, organizer, notes, submitter_email } = body;

    if (!event_url || typeof event_url !== "string" || !event_url.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "A valid official event URL starting with http:// or https:// is required." },
        { status: 400 }
      );
    }

    const suggestion = await createSuggestion({
      event_url: event_url.trim(),
      event_name: event_name?.trim() || null,
      organizer: organizer?.trim() || null,
      notes: notes?.trim() || null,
      submitter_email: submitter_email?.trim() || null,
    });

    return NextResponse.json({
      success: true,
      message: "Suggestion received and added to verification queue.",
      suggestion_id: suggestion.id,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record suggestion";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
