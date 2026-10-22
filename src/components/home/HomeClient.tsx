"use client";

import React from "react";
import { OrbitEvent } from "@/types/event";
import HybridHomeClient from "@/components/home/HybridHomeClient";
import WelcomeOverlay from "@/components/auth/WelcomeOverlay";
import { useLiveEvents } from "@/lib/useLiveEvents";

interface HomeClientProps {
  initialEvents: OrbitEvent[];
}

export default function HomeClient({ initialEvents }: HomeClientProps) {
  const liveEvents = useLiveEvents(initialEvents, "all");

  return (
    <>
      <WelcomeOverlay />
      <HybridHomeClient initialEvents={liveEvents} />
    </>
  );
}
