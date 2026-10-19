import React, { Suspense } from "react";
import ExploreClient from "@/components/explore/ExploreClient";
import { getAllEvents } from "@/lib/db";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Free Tech Events in Bengaluru — ORBIT BLR",
  description:
    "Search and filter through upcoming free in-person developer meetups, hackathons, and AI conferences across Koramangala, HSR Layout, Whitefield, and Bengaluru tech hubs.",
};

export default async function ExplorePage() {
  const events = await getAllEvents({ includeUnpublished: false });

  return (
    <Suspense fallback={<div className="p-12 text-center text-orbit-muted font-mono">Loading events directory...</div>}>
      <ExploreClient initialEvents={events} />
    </Suspense>
  );
}
