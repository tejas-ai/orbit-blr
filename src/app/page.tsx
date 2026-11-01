import React from "react";
import type { Metadata } from "next";
import HomeClient from "@/components/home/HomeClient";
import { getAllEvents } from "@/lib/db";
import { HOMEPAGE_TITLE, HOMEPAGE_DESCRIPTION } from "@/lib/site";

// Ensure fresh dynamic data on each request
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: HOMEPAGE_TITLE,
  description: HOMEPAGE_DESCRIPTION,
};

export default async function HomePage() {
  const events = await getAllEvents({ includeUnpublished: false });

  return <HomeClient initialEvents={events} />;
}

