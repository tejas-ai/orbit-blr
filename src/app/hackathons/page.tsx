import React, { Suspense } from "react";
import type { Metadata } from "next";
import ExploreClient from "@/components/explore/ExploreClient";
import { getAllEvents } from "@/lib/db";
import { isHackathonEvent } from "@/lib/hackathons";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Free In-Person Hackathons in Bengaluru — ORBIT BLR",
  description: "Find independently verified free Bengaluru hackathons, build sprints, student coding competitions and application deadlines.",
  alternates: { canonical: "/hackathons" },
  openGraph: {
    title: "Free In-Person Hackathons in Bengaluru — ORBIT BLR",
    description: "Verified Bengaluru hackathons and build sprints, separate from the tech event directory.",
    url: `${SITE_URL}/hackathons`,
    siteName: SITE_NAME,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ORBIT BLR Hackathons" }],
  },
};

export default async function HackathonsPage() {
  const events = (await getAllEvents({ includeUnpublished: false })).filter(isHackathonEvent);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 sm:pt-5 sm:pb-3">
      <Suspense fallback={<div className="p-12 text-center">Loading hackathons...</div>}>
        <ExploreClient initialEvents={events} directory="hackathons" />
      </Suspense>
    </div>
  );
}
