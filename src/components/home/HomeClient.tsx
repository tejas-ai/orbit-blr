"use client";

import React, { useState, useMemo } from "react";
import { OrbitEvent, EventFilters as FilterStateType } from "@/types/event";
import DistrictHero from "@/components/home/DistrictHero";
import CategoryTileGrid from "@/components/home/CategoryTileGrid";
import EventFiltersBar from "@/components/events/EventFilters";
import EventCard from "@/components/events/EventCard";
import VerificationEngineExplainer from "@/components/home/VerificationEngineExplainer";
import BengaluruRadarMap from "@/components/home/BengaluruRadarMap";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { isHackathonEvent } from "@/lib/hackathons";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  SearchX,
  Flame,
  Zap,
  Radio,
  ChevronDown,
  Layers,
} from "lucide-react";
import Link from "next/link";

interface HomeClientProps {
  initialEvents: OrbitEvent[];
}

export default function HomeClient({ initialEvents }: HomeClientProps) {
  const { isSaved, toggleSave } = useSavedEvents();
  const [showRadarExploration, setShowRadarExploration] = useState(false);

  const [filters, setFilters] = useState<FilterStateType>({
    search: "",
    category: "all",
    benefits: "all",
    dateFilter: "all",
    registrationStatus: "all",
    area: "all",
    venueType: "all",
    sortBy: "date_asc",
  });

  // Featured events (highest quality perks, hackathons, or featured flag)
  const featuredEvents = useMemo(
    () =>
      initialEvents
        .filter((e) => e.featured || isHackathonEvent(e) || e.goodies_status === "confirmed")
        .slice(0, 3),
    [initialEvents]
  );

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = [...initialEvents];

    // Search query
    if (filters.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.area.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (q.includes("hack") && isHackathonEvent(e)) ||
          (e.topics_covered && e.topics_covered.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category with robust Hackathons detection
    if (filters.category && filters.category !== "all") {
      if (filters.category === "Hackathons") {
        result = result.filter((e) => isHackathonEvent(e));
      } else {
        result = result.filter((e) => e.category.toLowerCase() === filters.category!.toLowerCase());
      }
    }

    // Bengaluru Area
    if (filters.area && filters.area !== "all") {
      result = result.filter((e) => e.area.toLowerCase() === filters.area!.toLowerCase());
    }

    // Registration Status
    if (filters.registrationStatus && filters.registrationStatus !== "all") {
      result = result.filter((e) => e.registration_status === filters.registrationStatus);
    }

    // Venue Type
    if (filters.venueType && filters.venueType !== "all") {
      result = result.filter((e) => e.venue_type === filters.venueType);
    }

    // Perks / Benefits
    if (filters.benefits && filters.benefits !== "all") {
      if (filters.benefits === "both_confirmed") {
        result = result.filter(
          (e) =>
            (e.goodies_status === "confirmed" || e.goodies_status === "limited") &&
            (e.certificate_status === "confirmed" || e.certificate_status === "conditional")
        );
      } else if (filters.benefits === "certificates_confirmed") {
        result = result.filter(
          (e) => e.certificate_status === "confirmed" || e.certificate_status === "conditional"
        );
      } else if (filters.benefits === "goodies_confirmed") {
        result = result.filter(
          (e) => e.goodies_status === "confirmed" || e.goodies_status === "limited"
        );
      } else if (filters.benefits === "complimentary_food") {
        result = result.filter(
          (e) =>
            e.food_status === "complimentary_meals_confirmed" ||
            e.food_status === "refreshments_confirmed"
        );
      }
    }

    // Date Filter
    if (filters.dateFilter && filters.dateFilter !== "all") {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      result = result.filter((e) => {
        const eventDateStr = e.start_at.split("T")[0];
        const eventDate = new Date(e.start_at);

        if (filters.dateFilter === "today") return eventDateStr === todayStr;
        if (filters.dateFilter === "tomorrow") {
          const tom = new Date(now);
          tom.setDate(now.getDate() + 1);
          return eventDateStr === tom.toISOString().split("T")[0];
        }
        if (filters.dateFilter === "weekend") {
          const day = eventDate.getDay();
          return day === 0 || day === 6;
        }
        if (filters.dateFilter === "next_7_days") {
          const next7 = new Date(now);
          next7.setDate(now.getDate() + 7);
          return eventDate >= now && eventDate <= next7;
        }
        if (filters.dateFilter === "this_month") {
          return (
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    // Sort order
    if (filters.sortBy === "date_asc") {
      result.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
    } else if (filters.sortBy === "date_desc") {
      result.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
    } else if (filters.sortBy === "urgency") {
      const priority: Record<string, number> = {
        open: 1,
        approval_required: 2,
        waitlist: 3,
        not_yet_open: 4,
        full: 5,
        closed: 6,
      };
      result.sort((a, b) => (priority[a.registration_status] || 99) - (priority[b.registration_status] || 99));
    } else if (filters.sortBy === "benefits") {
      const score = (e: OrbitEvent) => {
        let s = 0;
        if (e.goodies_status === "confirmed") s += 3;
        if (e.goodies_status === "limited") s += 1;
        if (e.certificate_status === "confirmed") s += 3;
        if (e.certificate_status === "conditional") s += 2;
        if (e.food_status === "complimentary_meals_confirmed") s += 2;
        if (e.food_status === "refreshments_confirmed") s += 1;
        return s;
      };
      result.sort((a, b) => score(b) - score(a));
    }

    return result;
  }, [initialEvents, filters]);

  const handleSelectCategory = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat as any }));
    const el = document.getElementById("events-directory");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearchChange = (q: string) => {
    setFilters((prev) => ({ ...prev, search: q }));
  };

  const handleAreaChange = (area: string) => {
    setFilters((prev) => ({ ...prev, area }));
  };

  return (
    <div className="space-y-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 1. DISTRICT SPLIT HERO & SEARCH DOCK */}
        <DistrictHero
          events={initialEvents}
          onSearchChange={handleSearchChange}
          onAreaChange={handleAreaChange}
          onCategorySelect={handleSelectCategory}
        />

        {/* 2. CATEGORY TILES GRID */}
        <CategoryTileGrid
          selectedCategory={filters.category || "all"}
          onSelectCategory={handleSelectCategory}
        />

        {/* 3. MAIN DIRECTORY: THE BENGALURU EDIT */}
        <section id="events-directory" className="space-y-8 scroll-mt-24 pt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-orbit-border/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>The Bengaluru Edit • Live Directory</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight uppercase">
                DON&apos;T MISS WHAT&apos;S{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orbit-pink via-orbit-secondary to-orbit-signal">
                  COMING UP.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-orbit-muted mt-1.5 max-w-2xl font-normal font-sans">
                Handpicked from verified organiser listings. 100% free entry across Bengaluru tech corridors.
              </p>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-orbit-signal hover:underline"
            >
              <span>Explore all events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Filters Bar: Search, Category pills, Quick dates */}
          <EventFiltersBar
            filters={filters}
            onChange={setFilters}
            totalResults={filteredEvents.length}
          />

          {/* Results Grid */}
          <div className="pt-2">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredEvents.map((event, idx) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    priority={idx < 4}
                    isSaved={isSaved(event.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            ) : initialEvents.length === 0 ? (
              <div className="bg-orbit-card/80 border border-orbit-signal/30 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-glow">
                <div className="w-12 h-12 rounded-full bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-signal/40">
                  <ShieldCheck className="w-6 h-6 text-orbit-signal" />
                </div>
                <h3 className="font-display font-bold text-xl text-orbit-text">
                  Strict Verification Active — Review Queue in Progress
                </h3>
                <p className="text-xs sm:text-sm text-orbit-muted mt-2 leading-relaxed font-sans">
                  ORBIT BLR enforces a 100% zero-unverified event policy. All submitted events are held in the verification queue until direct official organizer registration links and perk evidence are independently confirmed.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/suggest"
                    className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all shadow-glow"
                  >
                    Submit an Event with Evidence
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-orbit-card/60 border border-orbit-border rounded-3xl p-12 text-center max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-border">
                  <SearchX className="w-6 h-6 text-orbit-muted" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  No events match your criteria
                </h3>
                <p className="text-xs text-orbit-muted mt-1.5 leading-relaxed font-sans">
                  Try widening your search terms, changing the date window, or resetting active perk filters.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        search: "",
                        category: "all",
                        benefits: "all",
                        dateFilter: "all",
                        registrationStatus: "all",
                        area: "all",
                        venueType: "all",
                        sortBy: "date_asc",
                      })
                    }
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg shadow-sm"
                  >
                    Reset All Filters
                  </button>
                  <Link
                    href="/suggest"
                    className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-white bg-orbit-surface border border-orbit-border hover:bg-orbit-surfaceHover"
                  >
                    Suggest an Event
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4. BUILDER & HACKATHON PROMO BANNER */}
        <section className="relative rounded-3xl p-8 sm:p-10 border border-orbit-border bg-gradient-to-r from-[#201644] via-[#160d36] to-[#09090b] shadow-card overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Built for Builders</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight uppercase">
                HAVE A HACKATHON ON YOUR RADAR?
              </h3>
              <p className="text-xs sm:text-sm text-orbit-muted leading-relaxed font-sans">
                Help the Bengaluru developer community discover more genuine, in-person, 100% free hackathons, sprints, and demo days across campus and corporate venues.
              </p>
            </div>

            <Link
              href="/suggest"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider bg-white text-orbit-bg hover:bg-orbit-highlight transition-all shadow-md shrink-0 self-start md:self-auto"
            >
              <span>Suggest a Free Event</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 5. PRESERVED TECH CORRIDORS RADAR & 7-POINT VERIFICATION PROTOCOL (Interactive Expandable) */}
        <section className="border-t border-orbit-border/80 pt-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-orbit-signal font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-orbit-signal" />
                Bengaluru Ecosystem Infrastructure
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                Tech Radar & Verification Protocol
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowRadarExploration(!showRadarExploration)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono bg-orbit-surface border border-orbit-border text-orbit-muted hover:text-white transition-all self-start sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5 text-orbit-signal" />
              <span>{showRadarExploration ? "Hide Tech Radar Map" : "Open 3D Tech Radar Map"}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showRadarExploration ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {showRadarExploration && (
            <div className="space-y-8 pt-4">
              <BengaluruRadarMap />
            </div>
          )}

          <div id="verification">
            <VerificationEngineExplainer />
          </div>
        </section>
      </div>
    </div>
  );
}
