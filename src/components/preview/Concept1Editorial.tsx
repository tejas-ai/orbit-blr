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
  Clock,
  Bookmark,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  Gift,
  Award,
  Coffee,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface Concept1Props {
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

export default function Concept1Editorial({ events }: Concept1Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: "all", label: "All Gatherings" },
    { id: "Hackathons", label: "Hackathons" },
    { id: "developer", label: "Developer Meetups" },
    { id: "ai", label: "AI & World Models" },
    { id: "security", label: "Cybersecurity" },
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
      if (selectedCategory !== "all") {
        if (selectedCategory === "Hackathons") matchesCat = isHack;
        else matchesCat = e.category.toLowerCase() === selectedCategory.toLowerCase();
      }

      const matchesArea = selectedArea === "all" || e.area.toLowerCase() === selectedArea.toLowerCase();

      return matchesSearch && matchesCat && matchesArea;
    });
  }, [events, search, selectedCategory, selectedArea]);

  return (
    <div className="orbit-3-root min-h-screen bg-[#FDFDFD] text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* 1. Swiss Editorial Minimalist Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/preview/concept-1" className="flex items-center gap-2 group">
              <span className="w-3 h-3 rounded-full bg-slate-900 group-hover:scale-125 transition-transform" />
              <div className="flex items-baseline gap-1.5 font-bold tracking-tight text-xl text-slate-950 font-serif">
                <span>ORBIT</span>
                <span className="text-xs uppercase tracking-widest text-slate-500 font-sans font-medium">
                  Bengaluru
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 pl-6 border-l border-slate-200 text-xs font-medium text-slate-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Bengaluru Tech Calendar</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Verified ₹0 Free Entry</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Bengaluru, KA</span>
            </div>
            <Link
              href="/suggest"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              Submit Meetup
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Editorial Masthead & Nearify-Style Search Dock */}
      <section className="border-b border-slate-200/70 bg-gradient-to-b from-white to-slate-50/60 py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold mb-4 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Concept 1: Swiss Editorial & Nearify Discovery</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight font-serif leading-[1.15]">
              Curated Technology Gatherings in Bengaluru.
            </h1>
            <p className="mt-3 text-slate-600 text-base md:text-lg leading-relaxed font-light">
              Genuinely free in-person developer meetups, hackathons, and conferences with verified admission, swag, and direct official registration.
            </p>
          </div>

          {/* Nearify-Style Search & Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-3 sm:p-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search meetups, hackathons, tech topics, or organizers..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 focus:border-slate-400 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Bengaluru Only</span>
                </div>

                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium outline-none cursor-pointer hover:bg-slate-100"
                >
                  <option value="all">All Neighborhoods</option>
                  <option value="kodihalli">Kodihalli</option>
                  <option value="whitefield">Whitefield</option>
                  <option value="bellandur">Bellandur</option>
                  <option value="koramangala">Koramangala</option>
                  <option value="electronic city">Electronic City</option>
                  <option value="kumaraswamy layout">Kumaraswamy Layout</option>
                </select>

                {(search || selectedCategory !== "all" || selectedArea !== "all") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("all");
                      setSelectedArea("all");
                    }}
                    className="px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal Category Row (Nearify Tabs) */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Event Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif">
              Showing Verified Events ({filtered.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly filtered: genuine verified links, real organizers, ₹0 registration.
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No events found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search terms.</p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
                setSelectedArea("all");
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((event) => {
              const thumb = getEventThumbnail(event);
              const dateInfo = formatDate(event.start_at);
              const isHack = isHackathonEvent(event);
              const isEventSaved = savedIds.includes(event.id);

              return (
                <article
                  key={event.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Poster Thumbnail Area */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <Image
                      src={thumb.src}
                      alt={thumb.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="eager"
                      unoptimized
                    />

                    {/* Top overlay pills */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-slate-900 shadow-sm backdrop-blur pointer-events-auto">
                        {isHack ? "Hackathon" : event.category.toUpperCase()}
                      </span>

                      <button
                        onClick={(e) => toggleSave(event.id, e)}
                        aria-label="Save event"
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm backdrop-blur transition-all pointer-events-auto ${
                          isEventSaved
                            ? "bg-slate-900 text-white"
                            : "bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950"
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Registration Status Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium shadow-sm backdrop-blur ${
                          event.registration_status === "open"
                            ? "bg-emerald-600 text-white"
                            : event.registration_status === "approval_required"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {event.registration_status === "open"
                          ? "Open Registration"
                          : event.registration_status === "approval_required"
                          ? "Approval Required"
                          : "Waitlist"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Organizer */}
                      <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase line-clamp-1 mb-1.5">
                        {event.organizer}
                      </p>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-950 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors font-serif">
                        <Link href={`/events/${event.slug}`}>{event.name}</Link>
                      </h3>

                      {/* Date & Time */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">{dateInfo.full}</span>
                          {dateInfo.time && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{dateInfo.time}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">
                            {event.area}, {event.venue}
                          </span>
                        </div>
                      </div>

                      {/* Verified Perks */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(event.food_status === "complimentary_meals_confirmed" || event.food_status === "refreshments_confirmed") && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-medium">
                            <Coffee className="w-3 h-3" />
                            <span>Free Refreshments</span>
                          </span>
                        )}
                        {event.goodies_status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-medium">
                            <Gift className="w-3 h-3" />
                            <span>Swag Kit</span>
                          </span>
                        )}
                        {event.certificate_status === "confirmed" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-medium">
                            <Award className="w-3 h-3" />
                            <span>Certificate</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                          ₹0 Free Admission
                        </span>
                        <span className="text-[10px] text-slate-400">100% In-Person</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/events/${event.slug}`}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1 transition-all"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Swiss Editorial Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="font-bold text-slate-900 font-serif text-sm">ORBIT BLR</span>
            <span className="text-slate-300">|</span>
            <span>Concept 1: Editorial Directory System</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 font-medium">
            <Link href="/preview/concept-2" className="hover:text-slate-900 text-indigo-600 font-semibold underline">
              Switch to Concept 2: District Marketplace →
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
