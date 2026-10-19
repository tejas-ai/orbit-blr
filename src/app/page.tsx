import React from "react";
import HomeClient from "@/components/home/HomeClient";
import { getAllEvents } from "@/lib/db";

// Ensure fresh dynamic data on each request
export const dynamic = "force-dynamic";

export default function HomePage() {
  const events = getAllEvents({ includeUnpublished: false });

  return <HomeClient initialEvents={events} />;
}
