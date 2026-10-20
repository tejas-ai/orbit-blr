import React from "react";
import { getAllEvents } from "@/lib/db";
import PreviewClient from "./PreviewClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ORBIT BLR 3.0 — Design Concept Evaluation Hub",
  description: "Side-by-side interactive evaluation for ORBIT BLR 3.0 visual concepts.",
};

export default async function PreviewHubPage() {
  const events = await getAllEvents({ includeUnpublished: false });
  return <PreviewClient events={events} />;
}
