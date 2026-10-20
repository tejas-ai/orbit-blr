import React from "react";
import { getAllEvents } from "@/lib/db";
import HybridHomeClient from "@/components/home/HybridHomeClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Option C: Refined Hybrid Homepage | ORBIT BLR 3.0",
  description: "Refined hybrid design combining Concept 2's event discovery with Concept 1's clean editorial layout and search experience.",
};

export default async function HybridPreviewPage() {
  const events = await getAllEvents({ includeUnpublished: false });
  return <HybridHomeClient initialEvents={events} />;
}
