import { NextRequest, NextResponse } from "next/server";
import { getFilteredEvents } from "@/lib/db";
import { EventFilters } from "@/types/event";
import { isHackathonEvent } from "@/lib/hackathons";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: EventFilters = {
      city: searchParams.get("city")?.slice(0, 100) || undefined,
      price: (searchParams.get("price") as EventFilters["price"]) || undefined,
      search: searchParams.get("q") || undefined,
      category: (searchParams.get("category") as any) || undefined,
      benefits: (searchParams.get("benefits") as any) || undefined,
      dateFilter: ((searchParams.get("when") || searchParams.get("date")) as EventFilters["dateFilter"]) || undefined,
      customDate: searchParams.get("customDate") || undefined,
      registrationStatus: (searchParams.get("status") as any) || undefined,
      area: searchParams.get("area") || undefined,
      venueType: (searchParams.get("venue") as any) || undefined,
      sortBy: (searchParams.get("sort") as any) || "date_asc",
    };

    // Preserve unfiltered API responses for existing consumers. Directory
    // screens explicitly query ?type=events or ?type=hackathons.
    const type = searchParams.get("type");
    if (type && !["all", "events", "hackathons"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }
    if (filters.price && !["all", "free", "paid"].includes(filters.price)) {
      return NextResponse.json({ success: false, error: "Invalid price" }, { status: 400 });
    }
    if (filters.dateFilter && !["all", "today", "tomorrow", "weekend", "weekday", "next_7_days", "this_month", "custom"].includes(filters.dateFilter)) {
      return NextResponse.json({ success: false, error: "Invalid date preset" }, { status: 400 });
    }
    const events = (await getFilteredEvents(filters, { includeUnpublished: false }))
      .filter((e) => type === "hackathons" ? isHackathonEvent(e) : type === "events" ? !isHackathonEvent(e) : true);

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: "Event listings are temporarily unavailable" }, { status: 503 });
  }
}
