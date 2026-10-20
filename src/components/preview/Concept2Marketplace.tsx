"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail } from "@/lib/thumbnails";
import { isHackathonEvent } from "@/lib/hackathons";
import {
  Search,
  MapPin,
  Calendar,
  Bookmark,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Zap,
  Code,
  Shield,
  Layers,
  Heart,
  ChevronRight,
  SlidersHorizontal,
  X,
  Coffee,
  Gift,
  Award,
} from "lucide-react";

interface Concept2Props {
  events: OrbitEvent[];
}

function formatDate(iso?: string | null) {
  if (!iso) return { month: "TBA", day: "--", full: "Date TBA", time: "" };
  try {
    const d = new Date(iso);
    const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Kolkata" }).toUpperCase();
    const day = d.toLocaleDateString("en-US", { day: "numeric", timeZone: "Asia/Kolkata" });
    const full = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    return { month, day, full, time };
  } catch {
    return { month: "TBA", day: "--", full: "Date TBA", time: "" };
  }
}

export default function Concept2Marketplace({ events }: Concept2Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("all");

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "Hackathons", label: "Hackathons", icon: Zap },
    { id: "developer", label: "Developer", icon: Code },
    { id: "ai", label: "AI & World Models", icon: Layers },
    { id: "security", label: "Cybersecurity", icon: Shield },
  ];

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q) ||
        (q.includes("hack") && isHackathonEvent(e));

      const isHack = isHackathonEvent(e);
      let matchesCat = true;
      if (activeCategory !== "all") {
        if (activeCategory === "Hackathons") matchesCat = isHack;
        else matchesCat = e.category.toLowerCase() === activeCategory.toLowerCase();
      }

      const matchesArea = selectedArea === "all" || e.area.toLowerCase() === selectedArea.toLowerCase();

      return matchesSearch && matchesCat && matchesArea;
    });
  }, [events, search, activeCategory, selectedArea]);

  // Featured spotlight event (first hackathon or first event)
  const spotlightEvent = useMemo(() => {
    return events.find((e) => isHackathonEvent(e)) || events[0];
  }, [events]);

  const spotlightThumb = spotlightEvent ? getEventThumbnail(spotlightEvent) : null;
  const spotlightDate = spotlightEvent ? formatDate(spotlightEvent.start_at) : null;

  return (
    <div className="orbit-3-root min-h-screen bg-[#FAF9FF] text-slate-900 font-sans antialiased selection:bg-[#7C3AED] selection:text-white">
      {/* 1. District Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Location selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/preview/concept-2" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6A38EB] to-[#9333EA] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                O
              </div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900">
                ORBIT <span className="text-[#6A38EB]">BLR</span>
              </div>
            </Link>

            {/* Location Pill (District Style) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50/80 border border-purple-200/60 text-xs font-semibold text-purple-900">
              <MapPin className="w-3.5 h-3.5 text-[#6A38EB]" />
              <span>Bengaluru, India</span>
              <ChevronDown className="w-3 h-3 text-purple-400" />
            </div>
          </div>

          {/* Right Action / Saved Events */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                className="w-10 h-10 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200/80 flex items-center justify-center text-purple-900 transition-colors"
                aria-label="Saved events"
              >
                <Bookmark className="w-4 h-4" />
                {savedIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#6A38EB] text-white text-[10px] font-bold flex items-center justify-center shadow">
                    {savedIds.length}
                  </span>
                )}
              </button>
            </div>

            <Link
              href="/suggest"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] text-white text-xs font-bold transition-all shadow-sm shadow-purple-500/20"
            >
              <span>+ List Event</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero & Search Header */}
      <section className="pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Subtle Concept Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#6A38EB]" />
            <span>Concept 2: Modern Event-Marketplace (District UI)</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Discover Events Around You
              </h1>
              <p className="mt-1 text-slate-500 text-sm">
                Authentic developer meetups, hackathons, and technology summits in Bengaluru.
              </p>
            </div>

            {/* Search Input Bar (District Pill Style) */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, organizers..."
                className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white border border-purple-200/80 focus:border-[#6A38EB] text-slate-900 text-xs placeholder:text-slate-400 shadow-sm outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* District Category Pills (Exact Reference Match) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                    isActive
                      ? "bg-[#6A38EB] text-white shadow-purple-500/25 scale-105"
                      : "bg-white text-slate-700 border border-purple-200/70 hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#6A38EB]"}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Spotlight Banner Card (Inspired by District top carousel) */}
          {spotlightEvent && spotlightThumb && spotlightDate && (
            <div className="mt-6 rounded-3xl bg-gradient-to-r from-purple-100/70 via-indigo-50/60 to-purple-50/40 border border-purple-200/60 p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-full md:w-72 aspect-[16/9] md:aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-100">
                  <Image
                    src={spotlightThumb.src}
                    alt={spotlightThumb.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-[#6A38EB] font-extrabold text-[10px] tracking-wide uppercase shadow">
                    Featured Spotlight
                  </div>
                </div>

                <div className="flex-1 w-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{spotlightDate.full}</span>
                      <span className="text-purple-300">•</span>
                      <span>{spotlightEvent.area}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                      {spotlightEvent.name}
                    </h2>

                    <p className="mt-2 text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {spotlightEvent.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-purple-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        ₹0 Free Entry
                      </span>
                      {(spotlightEvent.food_status === "complimentary_meals_confirmed" || spotlightEvent.food_status === "refreshments_confirmed") && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 font-medium">
                          <Coffee className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Snacks Included</span>
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/events/${spotlightEvent.slug}`}
                      className="px-5 py-2.5 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <span>View Event</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Main Event Grid ("Nearby You / Happening in Bengaluru") */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Nearby you in Bengaluru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified tech meetups & hackathons ready for RSVP ({filtered.length})
            </p>
          </div>

          <span className="text-xs font-bold text-[#6A38EB] hover:underline cursor-pointer">
            See All ({filtered.length})
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center max-w-md mx-auto shadow-sm">
            <Search className="w-10 h-10 text-purple-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No events found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your category or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((event) => {
              const thumb = getEventThumbnail(event);
              const dateInfo = formatDate(event.start_at);
              const isHack = isHackathonEvent(event);
              const isEventSaved = savedIds.includes(event.id);

              return (
                <div
                  key={event.id}
                  className="group bg-white rounded-3xl border border-purple-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Poster Thumbnail Area with District Date Badge Overlay */}
                  <div className="relative aspect-[4/3] bg-purple-50 overflow-hidden">
                    <Image
                      src={thumb.src}
                      alt={thumb.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="eager"
                      unoptimized
                    />

                    {/* Bookmark Pill Button (District Style) */}
                    <button
                      onClick={(e) => toggleSave(event.id, e)}
                      aria-label="Save event"
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur transition-all ${
                        isEventSaved
                          ? "bg-[#6A38EB] text-white"
                          : "bg-white/90 text-slate-700 hover:text-[#6A38EB]"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* Registration Status Pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur ${
                          event.registration_status === "open"
                            ? "bg-emerald-600 text-white"
                            : event.registration_status === "approval_required"
                            ? "bg-amber-600 text-white"
                            : "bg-purple-900 text-white"
                        }`}
                      >
                        {event.registration_status === "open"
                          ? "Open"
                          : event.registration_status === "approval_required"
                          ? "Approval Req"
                          : "Waitlist"}
                      </span>
                    </div>

                    {/* District Date Badge Overlay (Bottom Right of poster) */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 text-center shadow-md border border-purple-100 min-w-[50px]">
                      <div className="text-[10px] font-extrabold text-[#6A38EB] tracking-wider uppercase">
                        {dateInfo.month}
                      </div>
                      <div className="text-lg font-black text-slate-900 leading-none">
                        {dateInfo.day}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category Tag */}
                      <div className="inline-block px-2 py-0.5 rounded-md bg-purple-50 text-[#6A38EB] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        {isHack ? "Hackathon" : event.category}
                      </div>

                      {/* Event Title */}
                      <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#6A38EB] transition-colors">
                        <Link href={`/events/${event.slug}`}>{event.name}</Link>
                      </h3>

                      {/* Organizer */}
                      <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#6A38EB]" />
                        <span>{event.organizer}</span>
                      </p>

                      {/* Location & Time */}
                      <div className="mt-2 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="line-clamp-1">{event.area}, Bengaluru</span>
                        </div>
                        {dateInfo.time && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>{dateInfo.time}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Pricing & Action Button */}
                    <div className="mt-4 pt-3 border-t border-purple-100/70 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-black text-slate-900">₹0</span>
                        <span className="text-[10px] text-slate-500 ml-1 font-medium">Free Entry</span>
                      </div>

                      <Link
                        href={`/events/${event.slug}`}
                        className="px-3.5 py-1.5 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] text-white text-xs font-bold transition-all shadow-sm shadow-purple-500/20 flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. District Search Other Events CTA (Exact Reference Match) */}
        <div className="flex justify-center mt-12 mb-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 py-3 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>Search other events</span>
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* 5. Modern Marketplace Footer */}
      <footer className="mt-16 border-t border-purple-100 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6A38EB] text-white font-bold flex items-center justify-center text-xs">
              O
            </div>
            <span className="font-extrabold text-slate-900 text-sm">ORBIT BLR 3.0</span>
            <span className="text-purple-200">|</span>
            <span>Concept 2: District Event Marketplace</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
            <Link href="/preview/concept-1" className="hover:text-slate-900 text-[#6A38EB] font-bold underline">
              ← Switch to Concept 1: Editorial Directory
            </Link>
            <Link href="/" className="hover:text-slate-900">
              Back to Original
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
