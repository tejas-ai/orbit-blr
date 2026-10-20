"use client";

import React from "react";
import { OrbitEvent } from "@/types/event";
import HybridHomeClient from "@/components/home/HybridHomeClient";

interface HomeClientProps {
  initialEvents: OrbitEvent[];
}

export default function HomeClient({ initialEvents }: HomeClientProps) {
  return <HybridHomeClient initialEvents={initialEvents} />;
}
