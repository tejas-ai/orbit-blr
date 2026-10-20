import React from "react";
import { getAllEvents } from "@/lib/db";
import Concept2Marketplace from "@/components/preview/Concept2Marketplace";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Concept 2: District Modern Event-Marketplace | ORBIT BLR 3.0",
  description: "Preview Concept 2 for ORBIT BLR 3.0 redesign.",
};

export default async function Concept2Page() {
  const events = await getAllEvents({ includeUnpublished: false });
  return <Concept2Marketplace events={events} />;
}
