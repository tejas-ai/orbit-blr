import React from "react";
import { getAllEvents } from "@/lib/db";
import Concept1Editorial from "@/components/preview/Concept1Editorial";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Concept 1: Swiss Editorial & Nearify Event Discovery | ORBIT BLR 3.0",
  description: "Preview Concept 1 for ORBIT BLR 3.0 redesign.",
};

export default async function Concept1Page() {
  const events = await getAllEvents({ includeUnpublished: false });
  return <Concept1Editorial events={events} />;
}
