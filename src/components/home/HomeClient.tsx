"use client";

import React from "react";
import { OrbitEvent } from "@/types/event";
import HybridHomeClient from "@/components/home/HybridHomeClient";
import WelcomeOverlay from "@/components/auth/WelcomeOverlay";

interface HomeClientProps {
  initialEvents: OrbitEvent[];
}

export default function HomeClient({ initialEvents }: HomeClientProps) {
  return (
    <>
      <WelcomeOverlay />
      <HybridHomeClient initialEvents={initialEvents} />
    </>
  );
}
