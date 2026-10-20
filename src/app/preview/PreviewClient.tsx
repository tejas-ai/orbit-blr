"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OrbitEvent } from "@/types/event";
import HybridHomeClient from "@/components/home/HybridHomeClient";
import Concept1Editorial from "@/components/preview/Concept1Editorial";
import Concept2Marketplace from "@/components/preview/Concept2Marketplace";
import { Sparkles, Eye, Check, ExternalLink, Zap } from "lucide-react";

interface PreviewClientProps {
  events: OrbitEvent[];
}

export default function PreviewClient({ events }: PreviewClientProps) {
  const [activeConcept, setActiveConcept] = useState<"hybrid" | "concept1" | "concept2">("hybrid");

  return (
    <div className="orbit-3-root min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Top Floating Evaluation Bar */}
      <div className="sticky top-0 z-50 bg-slate-950 text-white shadow-xl px-4 py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-extrabold text-sm tracking-wide uppercase">
              ORBIT BLR 3.0 Design Review Hub
            </span>
            <span className="hidden md:inline text-xs text-slate-400">
              (Live Neon PostgreSQL Data — {events.length} Verified Events)
            </span>
          </div>

          {/* Toggle Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveConcept("hybrid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeConcept === "hybrid"
                  ? "bg-gradient-to-r from-[#6A38EB] to-[#9333EA] text-white shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Option C: Refined Hybrid (Selected)</span>
            </button>

            <button
              onClick={() => setActiveConcept("concept1")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeConcept === "concept1"
                  ? "bg-white text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Concept 1</span>
            </button>

            <button
              onClick={() => setActiveConcept("concept2")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeConcept === "concept2"
                  ? "bg-white text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#6A38EB]" />
              <span>Concept 2</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            <Link
              href={
                activeConcept === "hybrid"
                  ? "/preview/hybrid"
                  : activeConcept === "concept1"
                  ? "/preview/concept-1"
                  : "/preview/concept-2"
              }
              target="_blank"
              className="text-slate-400 hover:text-white flex items-center gap-1"
            >
              <span>Full View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Render the Active Concept */}
      <div className="w-full">
        {activeConcept === "hybrid" ? (
          <HybridHomeClient initialEvents={events} />
        ) : activeConcept === "concept1" ? (
          <Concept1Editorial events={events} />
        ) : (
          <Concept2Marketplace events={events} />
        )}
      </div>
    </div>
  );
}
