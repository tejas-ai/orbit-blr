"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail, getCategoryFallback } from "@/lib/thumbnails";
import { isHackathonEvent, extractHackathonDetails } from "@/lib/hackathons";
import { useSavedEvents } from "@/lib/useSavedEvents";
import EventCard from "@/components/events/EventCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Bookmark,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Filter,
  X,
  Gift,
  Award,
  Coffee,
  ChevronRight,
  ChevronLeft,
  Zap,
  Code,
  Shield,
  Layers,
  Users,
  Timer,
  CheckCircle2,
  ChevronDown,
  Compass,
} from "lucide-react";

interface HybridHomeClientProps {
  initialEvents: OrbitEvent[];
}

function formatDate(iso?: string | null) {
  if (!iso) return { month: "TBA", day: "--", full: "Date TBA", time: "", isWeekend: false };
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
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return { month, day, full, time, isWeekend };
  } catch {
    return { month: "TBA", day: "--", full: "Date TBA", time: "", isWeekend: false };
  }
}

/**
 * Defensive poster image component:
 * Guarantees zero broken image icons by automatically falling back to category SVG artwork.
 * Displays the complete uncropped image with intrinsic aspect ratio.
 */
function DefensivePosterImage({
  event,
  priority = false,
  className = "object-contain",
}: {
  event: OrbitEvent;
  priority?: boolean;
  className?: string;
}) {
  const thumb = getEventThumbnail(event);
  const fallback = getCategoryFallback(event);
  const [src, setSrc] = useState(thumb.src);

  return (
    <Image
      src={src}
      alt={thumb.alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={className}
      priority={priority}
      loading="eager"
      onError={() => {
        if (src !== fallback) {
          setSrc(fallback);
        }
      }}
      unoptimized
    />
  );
}

export default function HybridHomeClient({ initialEvents }: HybridHomeClientProps) {
  const { isSaved, toggleSave, savedCount } = useSavedEvents();
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedPerk, setSelectedPerk] = useState("all");

  // Category Configuration
  const categories = [
    { id: "all", label: "All Gatherings", icon: Sparkles },
    { id: "Hackathons", label: "Free Hackathons", icon: Zap },
    { id: "developer", label: "Developer Meetups", icon: Code },
    { id: "ai", label: "AI & World Models", icon: Layers },
    { id: "security", label: "Cybersecurity", icon: Shield },
  ];

  // Distinct Hackathons & Regular Events
  const hackathonEvents = useMemo(
    () => initialEvents.filter((e) => isHackathonEvent(e)),
    [initialEvents]
  );

  // Horizontal category scroll helpers
  const handleScrollCategories = (direction: "left" | "right") => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // DYNAMIC FEATURED SPOTLIGHT SELECTION:
  // Strictly filters out expired deadlines and closed events.
  // Prioritizes open registration events with confirmed organizer perks.
  const spotlightEvent = useMemo(() => {
    const now = Date.now();

    const viableEvents = initialEvents.filter((e) => {
      // Must not be in the past
      const end = e.end_at ? new Date(e.end_at).getTime() : e.start_at ? new Date(e.start_at).getTime() : 0;
      if (end > 0 && end < now) return false;

      // Must not have closed registration
      if (e.registration_status === "closed" || e.registration_status === "full") return false;

      // If it is a hackathon, ensure application deadline has not expired
      const hack = extractHackathonDetails(e);
      if (hack.isHackathon && hack.isDeadlinePassed) return false;

      return true;
    });

    if (viableEvents.length === 0) return initialEvents[0];

    // Rank candidates:
    // 1. Open registration status
    // 2. Confirmed perks (meals, swags, or certificate)
    // 3. Chronological proximity
    return viableEvents.sort((a, b) => {
      const aOpen = a.registration_status === "open" ? 1 : 0;
      const bOpen = b.registration_status === "open" ? 1 : 0;
      if (aOpen !== bOpen) return bOpen - aOpen;

      const aPerks =
        a.goodies_status === "confirmed" ||
        a.food_status === "complimentary_meals_confirmed" ||
        a.food_status === "refreshments_confirmed"
          ? 1
          : 0;
      const bPerks =
        b.goodies_status === "confirmed" ||
        b.food_status === "complimentary_meals_confirmed" ||
        b.food_status === "refreshments_confirmed"
          ? 1
          : 0;
      if (aPerks !== bPerks) return bPerks - aPerks;

      const aTime = a.start_at ? new Date(a.start_at).getTime() : 0;
      const bTime = b.start_at ? new Date(b.start_at).getTime() : 0;
      return aTime - bTime;
    })[0];
  }, [initialEvents]);

  const spotlightDate = spotlightEvent ? formatDate(spotlightEvent.start_at) : null;
  const spotlightHack = spotlightEvent ? extractHackathonDetails(spotlightEvent) : null;

  // Filter & Search Logic
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      // 1. Text Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (q.includes("hack") && isHackathonEvent(e)) ||
        (e.topics_covered && e.topics_covered.some((t) => t.toLowerCase().includes(q)));

      // 2. Category Filter (with robust Hackathons support)
      const isHack = isHackathonEvent(e);
      let matchesCat = true;
      if (selectedCategory !== "all") {
        if (selectedCategory === "Hackathons") matchesCat = isHack;
        else matchesCat = e.category.toLowerCase() === selectedCategory.toLowerCase();
      }

      // 3. Area / Neighborhood Filter
      const matchesArea =
        selectedArea === "all" || e.area.toLowerCase().includes(selectedArea.toLowerCase());

      // 4. Date Filter
      let matchesDate = true;
      if (selectedDate !== "all") {
        const dateInfo = formatDate(e.start_at);
        if (selectedDate === "weekend") {
          matchesDate = dateInfo.isWeekend;
        } else if (selectedDate === "upcoming_7_days") {
          if (e.start_at) {
            const evDate = new Date(e.start_at).getTime();
            const now = Date.now();
            const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
            matchesDate = evDate >= now && evDate <= weekAhead;
          }
        }
      }

      // 5. Perks Filter
      let matchesPerk = true;
      if (selectedPerk !== "all") {
        if (selectedPerk === "food") {
          matchesPerk =
            e.food_status === "complimentary_meals_confirmed" ||
            e.food_status === "refreshments_confirmed";
        } else if (selectedPerk === "swag") {
          matchesPerk = e.goodies_status === "confirmed";
        } else if (selectedPerk === "certificate") {
          matchesPerk = e.certificate_status === "confirmed";
        }
      }

      return matchesSearch && matchesCat && matchesArea && matchesDate && matchesPerk;
    });
  }, [initialEvents, search, selectedCategory, selectedArea, selectedDate, selectedPerk]);

  const hasActiveFilters =
    Boolean(search) ||
    selectedCategory !== "all" ||
    selectedArea !== "all" ||
    selectedDate !== "all" ||
    selectedPerk !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedArea("all");
    setSelectedDate("all");
    setSelectedPerk("all");
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] font-sans antialiased flex flex-col transition-colors duration-300">
      {/* ========================================================= */}
      {/* 1. EDITORIAL HERO & PROMINENT NEARIFY SEARCH DOCK          */}
      {/* Reduced mobile padding & height for faster event discovery */}
      {/* ========================================================= */}
      <section className="border-b border-slate-200/80 dark:border-[#302B43] bg-gradient-to-b from-white via-[#FAF9FF]/40 to-slate-50/70 dark:from-[#0E0E16] dark:via-[#151522]/60 dark:to-[#0E0E16] pt-4 pb-6 sm:pt-10 sm:pb-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Editorial Masthead */}
          <ScrollReveal direction="down" className="max-w-3xl mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-[#1D1B2C] border border-purple-200/60 dark:border-[#302B43] text-[#6A38EB] dark:text-[#A78BFA] text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
              <span>Bengaluru Verified Tech Calendar</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif leading-[1.15]">
              Discover Genuinely Free Tech Gatherings in Bengaluru.
            </h1>

            {/* Accurate, unhyped description reflecting organiser-confirmed evidence */}
            <p className="mt-2 sm:mt-3 text-slate-600 dark:text-[#CBD5E1] text-xs sm:text-base leading-relaxed font-normal">
              Hand-verified developer meetups, conferences, and hackathons across Bengaluru. 100% free in-person admission with verified perks, refreshments, and official registration where confirmed by organisers.
            </p>

            <div className="mt-2.5 hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-[#CBD5E1]/80 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Organiser-verified evidence • Direct official registration links • Zero commercial paywalls</span>
            </div>
          </ScrollReveal>

          {/* Prominent Concept 1 Search Dock with Concept 2 Pills */}
          <ScrollReveal direction="down" delay={80} className="bg-white dark:bg-[#1D1B2C] rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-slate-200/90 dark:border-[#302B43] p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
              {/* Main Search Input (6 cols) */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search meetups, hackathons, AI topics, organizers, or venues..."
                  className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 dark:bg-[#151522] dark:hover:bg-[#151522]/90 focus:bg-white dark:focus:bg-[#151522] border border-slate-200/80 dark:border-[#302B43] focus:border-[#6A38EB] dark:focus:border-[#8B5CF6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] text-slate-900 dark:text-[#F7F5FF] text-xs sm:text-sm placeholder:text-slate-400 dark:placeholder:text-[#CBD5E1]/60 outline-none transition-all shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded"
                    aria-label="Clear search text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bengaluru Neighborhood Dropdown (3 cols) */}
              <div className="relative md:col-span-3">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full pl-8 pr-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 dark:bg-[#151522] dark:hover:bg-[#151522]/90 border border-slate-200/80 dark:border-[#302B43] text-slate-800 dark:text-[#F7F5FF] text-xs font-semibold outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer appearance-none transition-colors"
                >
                  <option value="all">All Neighborhoods</option>
                  <option value="kodihalli">Kodihalli (Indiranagar)</option>
                  <option value="whitefield">Whitefield</option>
                  <option value="bellandur">Bellandur / Bhoganahalli</option>
                  <option value="koramangala">Koramangala</option>
                  <option value="electronic city">Electronic City</option>
                  <option value="kumaraswamy layout">Kumaraswamy Layout</option>
                  <option value="kanakapura road">Kanakapura Road</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Date Filter Dropdown (3 cols) */}
              <div className="relative md:col-span-3">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-8 pr-7 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 dark:bg-[#151522] dark:hover:bg-[#151522]/90 border border-slate-200/80 dark:border-[#302B43] text-slate-800 dark:text-[#F7F5FF] text-xs font-semibold outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] cursor-pointer appearance-none transition-colors"
                >
                  <option value="all">Any Date (Upcoming)</option>
                  <option value="weekend">Weekends Only</option>
                  <option value="upcoming_7_days">Next 7 Days</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Horizontal Category Navigation with Scrolling Affordances & Controls */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#302B43]">
              <div className="relative flex items-center">
                {/* Scroll Left Button */}
                <button
                  type="button"
                  onClick={() => handleScrollCategories("left")}
                  aria-label="Scroll categories left"
                  className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] text-slate-600 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-[#F7F5FF] hover:bg-slate-50 dark:hover:bg-[#1D1B2C] shadow-sm items-center justify-center mr-1 transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Left gradient fade cue */}
                <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-[#1D1B2C] to-transparent pointer-events-none z-10" />

                {/* Scrollable Categories Row */}
                <div
                  ref={categoryScrollRef}
                  role="tablist"
                  aria-label="Event categories"
                  className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 scroll-smooth snap-x snap-mandatory touch-pan-x"
                >
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    const isHack = cat.id === "Hackathons";
                    return (
                      <button
                        key={cat.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shadow-sm shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1D1B2C] ${
                          isActive
                            ? "bg-[#6A38EB] dark:bg-[#8B5CF6] text-white shadow-purple-500/25 scale-[1.02]"
                            : isHack
                            ? "bg-amber-50/90 dark:bg-[#2A1D0D] text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 hover:border-amber-300 hover:bg-amber-100/60 dark:hover:bg-[#382611]"
                            : "bg-slate-50 dark:bg-[#151522] text-slate-700 dark:text-[#CBD5E1] border border-slate-200/80 dark:border-[#302B43] hover:border-purple-300 dark:hover:border-[#8B5CF6]/40 hover:bg-purple-50/40 dark:hover:bg-[#1D1B2C] hover:text-[#101223] dark:hover:text-[#F7F5FF]"
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 ${
                            isActive
                              ? "text-white"
                              : isHack
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-[#6A38EB] dark:text-[#A78BFA]"
                          }`}
                        />
                        <span>{cat.label}</span>
                        {isHack && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 text-[10px] font-extrabold">
                            {hackathonEvents.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right gradient fade cue */}
                <div className="hidden sm:block absolute right-8 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-[#1D1B2C] to-transparent pointer-events-none z-10" />

                {/* Scroll Right Button */}
                <button
                  type="button"
                  onClick={() => handleScrollCategories("right")}
                  aria-label="Scroll categories right"
                  className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] text-slate-600 dark:text-[#CBD5E1] hover:text-slate-950 dark:hover:text-[#F7F5FF] hover:bg-slate-50 dark:hover:bg-[#1D1B2C] shadow-sm items-center justify-center ml-1 transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Clear Filters Indicator */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-1 shrink-0 ml-3"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FEATURED OFFICIAL SPOTLIGHT SECTION (DYNAMIC)           */}
      {/* Fixed mobile spacing between heading and registration status*/}
      {/* ========================================================= */}
      {spotlightEvent && spotlightDate && (
        <section className="py-6 sm:py-8 bg-slate-50/50 dark:bg-[#151522]/30 border-b border-slate-200/70 dark:border-[#302B43] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="down">
              {/* Header row with safe mobile layout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6A38EB] dark:bg-[#8B5CF6]" />
                  <h2 className="text-xs font-extrabold text-slate-800 dark:text-[#F7F5FF] uppercase tracking-wider">
                    Featured Official Spotlight
                  </h2>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-[#1D1B2C] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-100 dark:border-[#302B43] text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {spotlightEvent.registration_status === "open"
                        ? "Open Registration Verified"
                        : "Organiser-Verified Event"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-purple-50 via-white to-indigo-50/60 dark:from-[#1D1B2C] dark:via-[#191629] dark:to-[#1D1B2C] border border-purple-200/80 dark:border-[#302B43] p-4 sm:p-7 shadow-sm transition-all hover:shadow-md dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-8">
                  {/* Spotlight Banner Graphic — 16:9 Aspect Ratio, Zero Overlays, Minimal Empty Space */}
                  <div className="relative w-full lg:w-[400px] aspect-[16/9] rounded-2xl overflow-hidden shrink-0 shadow-sm bg-[#FAF9FF] dark:bg-[#151022] border border-purple-100/70 dark:border-[#2D224C] flex items-center justify-center transition-colors">
                    <div className="relative w-full h-full">
                      <DefensivePosterImage
                        event={spotlightEvent}
                        priority={true}
                        className="object-contain object-center"
                      />
                    </div>
                  </div>

                  {/* Spotlight Content */}
                  <div className="flex-1 w-full flex flex-col justify-between">
                    <div>
                      {/* Top Badges Row (Moved outside the image) */}
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] font-extrabold text-[11px] tracking-wide uppercase border border-purple-200/80 dark:border-[#382C58]">
                          {spotlightHack?.isHackathon ? "Offline Hackathon" : "Verified Spotlight"}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wide border border-emerald-200/60 dark:border-emerald-800/50">
                          ₹0 Free Admission
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1E1830] text-slate-700 dark:text-[#CBD5E1] font-semibold text-[11px] border border-slate-200/70 dark:border-[#302B43]">
                          {spotlightEvent.registration_status === "open" ? "RSVP Open" : "Approval Required"}
                        </span>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] mb-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#8B5CF6]" />
                          <span>{spotlightDate.full}</span>
                        </div>
                        <span className="text-purple-300 dark:text-[#382C58]">•</span>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#CBD5E1] font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-purple-400 dark:text-[#A78BFA]" />
                          <span>{spotlightEvent.area}, Bengaluru</span>
                        </div>
                        {spotlightHack?.duration && (
                          <>
                            <span className="text-purple-300 dark:text-[#382C58]">•</span>
                            <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 text-[11px] font-bold">
                              {spotlightHack.duration}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight leading-snug">
                        <Link href={`/events/${spotlightEvent.slug}`} className="hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors">
                          {spotlightEvent.name}
                        </Link>
                      </h3>

                      <p className="mt-2 text-slate-600 dark:text-[#CBD5E1] text-xs sm:text-sm leading-relaxed line-clamp-3">
                        {spotlightEvent.description}
                      </p>

                      {/* Hackathon Specific Verified Highlights */}
                      {spotlightHack?.isHackathon && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {spotlightHack.teamSize && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-[#2A1D0D] border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                              <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>{spotlightHack.teamSize}</span>
                            </span>
                          )}
                          {spotlightHack.registrationDeadline && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-900/60 text-purple-900 dark:text-purple-300 font-semibold text-[11px]">
                              <Timer className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
                              <span>Deadline: {spotlightHack.registrationDeadline}</span>
                            </span>
                          )}
                          {spotlightHack.eligibility && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#151522] border border-transparent dark:border-[#302B43] text-slate-700 dark:text-[#CBD5E1] font-medium text-[11px]">
                              <span>Eligibility: {spotlightHack.eligibility}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Pricing & CTA */}
                    <div className="mt-5 pt-3.5 border-t border-purple-200/60 dark:border-[#302B43] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40 text-xs font-bold">
                          ₹0 Free Admission
                        </span>
                        {spotlightEvent.food_status === "complimentary_meals_confirmed" && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium">
                            <Coffee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Meals Confirmed</span>
                          </span>
                        )}
                        {spotlightEvent.goodies_status === "confirmed" && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium">
                            <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Swag Kit Confirmed</span>
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/events/${spotlightEvent.slug}`}
                        className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white text-xs font-bold shadow-md shadow-purple-500/25 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <span>View Event</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN EVENT CARDS FEED (DISTRICT PORTRAIT CARDS)         */}
      {/* ========================================================= */}
      <main id="events-feed" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1">
        {/* Section Heading & Result Stats */}
        <ScrollReveal direction="down" className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-[#F7F5FF] font-serif tracking-tight">
              {selectedCategory === "Hackathons"
                ? "Bengaluru Hackathons & Build Sprints"
                : "Upcoming Verified Gatherings"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
              Showing {filteredEvents.length} of {initialEvents.length} verified events • Benefits shown strictly when confirmed by organisers
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium">
            <span>Chronological order</span>
          </div>
        </ScrollReveal>

        {/* Empty State */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-[#1D1B2C] rounded-3xl border border-slate-200 dark:border-[#302B43] p-12 text-center max-w-md mx-auto shadow-sm my-8">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F7F5FF]">No events match your criteria</h3>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
              Try adjusting your category, neighborhood, or search query.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white text-xs font-semibold rounded-xl"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
            {filteredEvents.map((event, index) => (
              <ScrollReveal key={event.id} staggerIndex={index % 4}>
                <EventCard
                  event={event}
                  isSaved={isSaved(event.id)}
                  onToggleSave={toggleSave}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Natural District Feed Search CTA */}
        <ScrollReveal direction="down" className="flex justify-center mt-12 mb-6">
          <Link
            href="/explore"
            className="px-6 py-3 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>Explore All Bengaluru Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </ScrollReveal>
      </main>
    </div>
  );
}
