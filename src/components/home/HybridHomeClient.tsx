"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail, getCategoryFallback } from "@/lib/thumbnails";
import { isHackathonEvent, extractHackathonDetails } from "@/lib/hackathons";
import { useSavedEvents } from "@/lib/useSavedEvents";
import EventCard from "@/components/events/EventCard";
import EventCountdown from "@/components/events/EventCountdown";
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
    const weekday=d.toLocaleDateString("en-US",{weekday:"short",timeZone:"Asia/Kolkata"});
    const isWeekend=weekday==="Sat"||weekday==="Sun";
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
      loading={priority ? undefined : "lazy"}
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
  const [spotlightIndex,setSpotlightIndex] = useState(0);
  const [clockNow,setClockNow] = useState(0);
  useEffect(() => {
    const tick = () => setClockNow(Date.now());
    tick();
    const minute = window.setInterval(tick,60000);
    const rotation = window.setInterval(() => setSpotlightIndex(i => i+1),18000);
    return () => { window.clearInterval(minute);window.clearInterval(rotation); };
  }, []);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedPerk, setSelectedPerk] = useState("all");

  const categories = useMemo(() => {
    const kinds = Array.from(new Set(initialEvents.filter(e=>!isHackathonEvent(e)).map(e=>e.category)));
    const labels: Record<string,string> = {ai:"AI & ML",developer:"Developer",security:"Cybersecurity",startup:"Startups"};
    return [{id:"all",label:"All Events"},...kinds.sort().map(k=>({id:k.toLowerCase(),label:labels[k.toLowerCase()]||k}))];
  },[initialEvents]);
  const areas = useMemo(()=>Array.from(new Set(initialEvents.filter(e=>!isHackathonEvent(e)).map(e=>e.area).filter(Boolean))).sort(),[initialEvents]);
  const hackathonEvents = useMemo(()=>initialEvents.filter(e=>isHackathonEvent(e)&&(clockNow===0||new Date(e.end_at).getTime()>clockNow)),[initialEvents,clockNow]);

  // Spotlight ONLY for fully confirmed general-attendee goodies AND attendance certificates.
  // Winner-only, limited and conditional perks never qualify.
  const eligibleSpotlights = useMemo(()=>{
    const now = clockNow||Date.now();
    return initialEvents.filter(e=>!isHackathonEvent(e)&&e.publication_status==="published"&&
      e.is_free&&e.is_in_person&&e.goodies_status==="confirmed"&&e.certificate_status==="confirmed"&&
      !!e.last_verified_at&&!!e.source_urls?.length&&new Date(e.start_at).getTime()>now&&
      (e.registration_status==="open"||e.registration_status==="approval_required"))
      .sort((x,y)=>new Date(x.start_at).getTime()-new Date(y.start_at).getTime());
  },[initialEvents,clockNow]);
  // Every 18 sec rotate through trustworthy candidates, or retain the sole qualifying event.
  const spotlightEvent = eligibleSpotlights[spotlightIndex%eligibleSpotlights.length]||null;
  const spotlightDate = spotlightEvent ? formatDate(spotlightEvent.start_at) : null;
  const spotlightHack = spotlightEvent ? extractHackathonDetails(spotlightEvent) : null;

  // Filter & Search Logic
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((e) => {
      if (isHackathonEvent(e) || (clockNow!==0&&new Date(e.end_at).getTime()<=clockNow)) return false;
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

      // 2. Regular-event category filter only.
      const matchesCat = selectedCategory === "all" ||
        e.category.toLowerCase() === selectedCategory.toLowerCase();

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
    }).sort((x,y)=>new Date(x.start_at).getTime()-new Date(y.start_at).getTime());
  }, [initialEvents, search, selectedCategory, selectedArea, selectedDate, selectedPerk,clockNow]);

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
    <div className="orbit-wallpaper-page bg-[#FFFFFF] dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] font-sans antialiased flex flex-col transition-colors duration-300">
      {/* ========================================================= */}
      {/* 1. EDITORIAL HERO & PROMINENT NEARIFY SEARCH DOCK          */}
      {/* Reduced mobile padding & height for faster event discovery */}
      {/* ========================================================= */}
      <section className="orbit-wallpaper-hero border-b border-slate-200/80 dark:border-[#302B43] bg-gradient-to-b from-white via-[#FAF9FF]/40 to-slate-50/70 dark:from-[#0E0E16] dark:via-[#151522]/60 dark:to-[#0E0E16] pt-4 pb-4 sm:pt-6 sm:pb-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Editorial Masthead */}
          <ScrollReveal direction="down" className="max-w-3xl mb-4 sm:mb-5">
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
                  placeholder="Search events, AI topics, speakers or venues…"
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
                  <option value="all">All Bengaluru areas</option>
                  {areas.map(area=><option key={area} value={area.toLowerCase()}>{area}</option>)}
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

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#302B43] pt-3">
              {categories.map(cat=><button key={cat.id} type="button" aria-pressed={selectedCategory===cat.id} onClick={()=>setSelectedCategory(cat.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-violet-500 ${selectedCategory===cat.id?"border-violet-500 bg-violet-600 text-white":"border-[#302B43] bg-[#151522] text-[#CBD5E1] hover:border-violet-500"}`}>{cat.label}</button>)}
              {hasActiveFilters&&<button type="button" onClick={clearAllFilters} className="ml-auto text-xs text-violet-300 hover:text-white">Clear</button>}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. FEATURED OFFICIAL SPOTLIGHT SECTION (DYNAMIC)           */}
      {/* Fixed mobile spacing between heading and registration status*/}
      {/* ========================================================= */}
      {spotlightEvent && spotlightDate && (
        <section className="orbit-wallpaper-spotlight py-4 sm:py-5 bg-slate-50/50 dark:bg-[#151522]/30 border-b border-slate-200/70 dark:border-[#302B43] transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="down">
              {/* Header row with safe mobile layout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6A38EB] dark:bg-[#8B5CF6]" />
                  <h2 className="text-xs font-extrabold text-slate-800 dark:text-[#F7F5FF] uppercase tracking-wider">
                    Verified Goodies + Certificate Spotlight
                  </h2>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-[#1D1B2C] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-100 dark:border-[#302B43] text-[11px] font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {spotlightEvent.registration_status === "open"
                        ? "Attendee perks confirmed"
                        : "Attendee perks confirmed"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="rounded-3xl bg-gradient-to-r from-purple-50 via-white to-indigo-50/60 dark:from-[#1D1B2C] dark:via-[#191629] dark:to-[#1D1B2C] border border-purple-200/80 dark:border-[#302B43] p-4 sm:p-7 shadow-sm transition-all hover:shadow-md dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
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
                          Organizer-confirmed attendee perks
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

                    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2">
                      <EventCountdown startAt={spotlightEvent.start_at} endAt={spotlightEvent.end_at} prominent />
                      {eligibleSpotlights.length>1&&<div className="ml-auto flex items-center gap-2 text-xs text-[#CBD5E1]">
                        <button type="button" aria-label="Previous spotlight" onClick={()=>setSpotlightIndex(i=>(i-1+eligibleSpotlights.length)%eligibleSpotlights.length)} className="rounded-full border border-[#302B43] p-1.5 hover:border-violet-400"><ChevronLeft className="h-4 w-4"/></button>
                        {spotlightIndex%eligibleSpotlights.length+1} / {eligibleSpotlights.length}
                        <button type="button" aria-label="Next spotlight" onClick={()=>setSpotlightIndex(i=>i+1)} className="rounded-full border border-[#302B43] p-1.5 hover:border-violet-400"><ChevronRight className="h-4 w-4"/></button>
                      </div>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-emerald-300"><span className="inline-flex items-center gap-1"><Gift className="h-3.5 w-3.5"/> Goodies confirmed</span><span className="inline-flex items-center gap-1"><Award className="h-3.5 w-3.5"/> Certificate confirmed for attendees meeting organizer conditions</span></div>

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
      <section id="events-feed" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-5 pb-5 sm:pt-6 sm:pb-6">
        {/* Section Heading & Result Stats */}
        <ScrollReveal direction="down" className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-[#F7F5FF] font-serif tracking-tight">
              {"Upcoming Verified Tech Events"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-0.5">
              Showing {filteredEvents.length} of {initialEvents.filter(e=>!isHackathonEvent(e)&&(clockNow===0||new Date(e.end_at).getTime()>clockNow)).length} verified events • Benefits shown strictly when confirmed by organisers
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#CBD5E1] font-medium">
            <span>Soonest first · Bengaluru time</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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

        {/* Hackathons have a dedicated directory, never mixed cards. */}
        <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-[#2A1D0D] p-4 sm:p-5">
          <div>
            <p className="font-bold text-amber-950 dark:text-amber-200 text-sm">Looking for hackathons?</p>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80">{hackathonEvents.length} verified hackathons have a separate directory.</p>
          </div>
          <Link href="/hackathons" className="rounded-full bg-amber-600 px-5 py-2.5 text-white text-xs font-bold hover:bg-amber-700">Explore Hackathons →</Link>
        </div>
        
      </section>
    </div>
  );
}
