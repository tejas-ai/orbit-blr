"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail, getCategoryFallback } from "@/lib/thumbnails";
import { isHackathonEvent } from "@/lib/hackathons";
import { formatEventDate } from "@/lib/utils";
import {
  Search,
  MapPin,
  ArrowRight,
  Zap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Layers,
} from "lucide-react";

interface DistrictHeroProps {
  events: OrbitEvent[];
  onSearchChange?: (q: string) => void;
  onAreaChange?: (area: string) => void;
  onCategorySelect?: (category: string) => void;
}

export default function DistrictHero({
  events,
  onSearchChange,
  onAreaChange,
  onCategorySelect,
}: DistrictHeroProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");

  // Choose a spotlight event from verified events (prefer featured, hackathon or high quality event)
  const spotlightEvent =
    events.find((e) => e.featured) ||
    events.find((e) => isHackathonEvent(e)) ||
    events.find((e) => e.goodies_status === "confirmed") ||
    events[0];

  const spotlightThumb = spotlightEvent ? getEventThumbnail(spotlightEvent) : null;
  const [spotlightImgSrc, setSpotlightImgSrc] = useState(spotlightThumb?.src || "");

  const handleSpotlightImgError = () => {
    if (spotlightEvent) {
      const fb = getCategoryFallback(spotlightEvent);
      setSpotlightImgSrc(fb);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange && onAreaChange) {
      onSearchChange(searchQuery);
      onAreaChange(selectedArea);
      // Smooth scroll down to the directory section
      const el = document.getElementById("events-directory");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedArea && selectedArea !== "all") params.set("area", selectedArea);
      router.push(`/explore?${params.toString()}`);
    }
  };

  // Distinct areas from live events
  const uniqueAreas = Array.from(new Set(events.map((e) => e.area).filter(Boolean))).sort();

  return (
    <div className="w-full space-y-6 pt-2 pb-6">
      {/* 1. Live Indicator Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-orbit-muted border-b border-orbit-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">Bengaluru&apos;s verified free tech community directory</span>
        </div>
        <div className="text-[11px] text-orbit-subtle">
          100% Free Entry • Direct Official Registration
        </div>
      </div>

      {/* 2. Compact Split Editorial Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-[#18112E] via-[#120D24] to-[#0A0714] shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[440px]">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-purple-900/40 text-purple-300 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Find Your Community • Build What&apos;s Next</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15] break-words">
                BENGALURU TECH EVENTS <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-100 to-white">
                  &amp; IN-PERSON HACKATHONS.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
                Discover Bengaluru&apos;s most exciting free technology meetups, AI workshops, and hackathons — independently verified with direct official registration links.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/40 transition-all transform active:scale-95"
              >
                <span>Explore Free Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (onCategorySelect) {
                    onCategorySelect("Hackathons");
                    const el = document.getElementById("events-directory");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    router.push("/explore?category=Hackathons");
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 transition-all backdrop-blur-md"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Find Hackathons</span>
              </button>
            </div>
          </div>

          {/* Right Column: Spotlight Featured Event Card */}
          {spotlightEvent && (
            <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full overflow-hidden bg-[#100B20] border-t lg:border-t-0 lg:border-l border-purple-500/20 group">
              {/* Spotlight Event Poster Image with Robust Error Fallback */}
              {spotlightImgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={spotlightImgSrc}
                  alt={spotlightThumb?.alt || spotlightEvent.name}
                  onError={handleSpotlightImgError}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-950/50 to-[#0B0813] flex items-center justify-center p-8 text-center">
                  <span className="font-mono text-xs text-purple-300">ORBIT BLR Verified Series</span>
                </div>
              )}

              {/* Gradient Vignette for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0813] via-[#0B0813]/60 to-transparent pointer-events-none" />

              {/* Floating Live Metric Pill */}
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold tracking-wider bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/40 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{events.length} FREE EVENTS LIVE</span>
                </span>
              </div>

              {/* Spotlight Event Overlay Content */}
              <Link
                href={`/events/${spotlightEvent.slug}`}
                className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-[#140F24]/90 backdrop-blur-md border border-purple-500/20 hover:border-purple-400/50 transition-all space-y-1.5 group/card"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-purple-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Spotlight Event • ₹0 Entry
                  </span>
                  <span className="text-emerald-400 uppercase font-semibold">
                    {spotlightEvent.registration_status}
                  </span>
                </div>

                <h3 className="text-base font-display font-bold text-white group-hover/card:text-purple-300 transition-colors line-clamp-1">
                  {spotlightEvent.name}
                </h3>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{formatEventDate(spotlightEvent.start_at)}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{spotlightEvent.area}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Prominent District Search Dock */}
      <form
        onSubmit={handleSearchSubmit}
        className="relative z-20 w-full max-w-4xl mx-auto -mt-6 sm:-mt-8 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-[#150F28]/95 border border-purple-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        {/* Search Input */}
        <div className="relative flex-1 flex items-center">
          <Search className="w-5 h-5 text-purple-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              if (onSearchChange) onSearchChange(val);
            }}
            placeholder="Search hackathons, AI, Kotlin, cybersecurity, or places..."
            className="w-full pl-3 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-sans"
          />
        </div>

        {/* Vertical Divider */}
        <div className="hidden sm:block w-px h-8 bg-purple-500/20" />

        {/* Bengaluru Area Selector */}
        <div className="flex items-center px-2 py-1.5 sm:py-0">
          <MapPin className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
          <select
            value={selectedArea}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedArea(val);
              if (onAreaChange) onAreaChange(val);
            }}
            className="bg-transparent text-xs font-mono text-white focus:outline-none cursor-pointer pr-2 max-w-[160px]"
            aria-label="Filter by Bengaluru area"
          >
            <option value="all" className="bg-[#140F24] text-white">All Bengaluru</option>
            {uniqueAreas.map((area) => (
              <option key={area} value={area} className="bg-[#140F24] text-white">
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Find Events Button */}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-950/40 transition-all transform active:scale-95"
        >
          <span>Find Events</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* 4. Trust Bar */}
      <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 sm:gap-x-8 pt-2 text-xs font-mono text-orbit-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Independent Event Verification</span>
        </div>
        <span className="text-orbit-border hidden sm:inline">•</span>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-orbit-signal" />
          <span>₹0 Admission Only (Guaranteed)</span>
        </div>
        <span className="text-orbit-border hidden sm:inline">•</span>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-orbit-pink" />
          <span>Direct Organiser Registration</span>
        </div>
      </div>
    </div>
  );
}
