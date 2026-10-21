import React, { Suspense } from "react";
import ExploreClient from "@/components/explore/ExploreClient";
import { getAllEvents } from "@/lib/db";
import { isHackathonEvent } from "@/lib/hackathons";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Free Tech Events in Bengaluru — ORBIT BLR",
  description:
    "Search and filter through upcoming free in-person developer meetups, workshops, and AI conferences across Koramangala, HSR Layout, Whitefield, and Bengaluru tech hubs.",
  alternates: {
    canonical: "/explore",
  },
  openGraph: {
    title: "Explore Free Tech Events in Bengaluru — ORBIT BLR",
    description:
      "Search and filter through upcoming free in-person developer meetups, workshops, and AI conferences across Koramangala, HSR Layout, Whitefield, and Bengaluru tech hubs.",
    url: `${SITE_URL}/explore`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Explore Free Tech Events in Bengaluru — ORBIT BLR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Free Tech Events in Bengaluru — ORBIT BLR",
    description:
      "Search and filter through upcoming free in-person developer meetups, workshops, and AI conferences in Bengaluru.",
    images: ["/og-image.png"],
  },
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  // Old bookmarks and shared links now lead to the dedicated Hackathons page.
  if (params.category?.toLowerCase() === "hackathons") redirect("/hackathons");
  const events = (await getAllEvents({ includeUnpublished: false })).filter((e) => !isHackathonEvent(e));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 sm:pt-6 sm:pb-4">
      <Suspense fallback={<div className="p-12 text-center text-orbit-muted font-mono">Loading events directory...</div>}>
        <ExploreClient initialEvents={events} directory="events" />
      </Suspense>
    </div>
  );
}
