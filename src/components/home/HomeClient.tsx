"use client";
import { Suspense } from "react";
import type { OrbitEvent } from "@/types/event";
import DiscoveryClient from "./DiscoveryClient";
export default function HomeClient({ initialEvents }: { initialEvents: OrbitEvent[] }) {
  return <Suspense fallback={<div className="discovery-page">Loading events…</div>}><DiscoveryClient initialEvents={initialEvents} /></Suspense>;
}
