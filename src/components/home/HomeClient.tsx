"use client";

import React, { useState, useMemo } from "react";
import { OrbitEvent, EventFilters as FilterStateType } from "@/types/event";
import HeroSection from "@/components/home/HeroSection";
import QuickStatsBar from "@/components/home/QuickStatsBar";
import EventFiltersBar from "@/components/events/EventFilters";
import EventCard from "@/components/events/EventCard";
import VerificationEngineExplainer from "@/components/home/VerificationEngineExplainer";
import BengaluruRadarMap from "@/components/home/BengaluruRadarMap";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { Sparkles, ArrowRight, ShieldCheck, SearchX } from "lucide-react";
import Link from "next/link";

interface HomeClientProps {
  initialEvents: OrbitEvent[];
}

export default function HomeClient({ initialEvents }: HomeClientProps) {
  const { isSaved, toggleSave } = useSavedEvents();

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

  // Calculate live metrics for stats bar
  const swagCount = useMemo(
    () => initialEvents.filter((e) => e.goodies_status === "confirmed" || e.goodies_status === "limited").length,
    [initialEvents]
  );
  const certCount = useMemo(
    () => initialEvents.filter((e) => e.certificate_status === "confirmed" || e.certificate_status === "conditional").length,
    [initialEvents]
  );
  const hubCount = useMemo(
    () => new Set(initialEvents.map((e) => e.area)).size,
    [initialEvents]
  );

  // Featured events (highest quality perks and featured flag)
  const featuredEvents = useMemo(
    () => initialEvents.filter((e) => e.featured).slice(0, 3),
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
          (e.topics_covered && e.topics_covered.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category
    if (filters.category && filters.category !== "all") {
      result = result.filter((e) => e.category === filters.category);
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
          (e) => e.food_status === "complimentary_meals_confirmed" || e.food_status === "refreshments_confirmed"
        );
      }
    }

    // Date
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
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    // Sorting
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

  // Handler when clicking 3D node
  const handleSelectCategoryFrom3D = (category: string) => {
    setFilters((prev) => ({ ...prev, category: category as any }));
    const el = document.getElementById("events-directory");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-12">
      {/* 3D Hero Section */}
      <HeroSection onSelectCategory={handleSelectCategoryFrom3D} />

      {/* Quick Metrics Bar */}
      <QuickStatsBar
        totalEvents={initialEvents.length}
        swagCount={swagCount}
        certCount={certCount}
        hubCount={hubCount}
      />

      {/* Featured Verified Events Spotlight */}
      {featuredEvents.length > 0 && filters.category === "all" && !filters.search && (
        <section className="my-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orbit-signal" />
              <h2 className="text-xl sm:text-2xl font-display font-black text-orbit-text tracking-tight">
                Spotlight: Featured Free Events
              </h2>
            </div>
            <span className="text-xs font-mono text-orbit-signal font-semibold hidden sm:inline">
              Verified In-Person Tech Access
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                isSaved={isSaved(evt.id)}
                onToggleSave={toggleSave}
                variant="featured"
              />
            ))}
          </div>
        </section>
      )}

      {/* Main Event Discovery Engine Section */}
      <section id="events-directory" className="my-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Bengaluru Directory</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-orbit-text tracking-tight">
              Discover Free In-Person Tech Events
            </h2>
            <p className="text-xs sm:text-sm text-orbit-muted mt-1">
              Real dates in IST, physical Bengaluru venues, transparent perk statuses, and direct official registration links.
            </p>
          </div>
        </div>

        {/* Filters */}
        <EventFiltersBar
          filters={filters}
          onChange={setFilters}
          totalResults={filteredEvents.length}
        />

        {/* Results Grid */}
        <div className="mt-8">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSaved={isSaved(event.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : initialEvents.length === 0 ? (
            <div className="bg-orbit-card/60 border border-orbit-signal/30 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-glow">
              <div className="w-12 h-12 rounded-full bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-signal/40">
                <ShieldCheck className="w-6 h-6 text-orbit-signal" />
              </div>
              <h3 className="font-display font-bold text-xl text-orbit-text">
                Strict Verification Active — Review Queue in Progress
              </h3>
              <p className="text-xs sm:text-sm text-orbit-muted mt-2 leading-relaxed">
                ORBIT BLR enforces a 100% zero-unverified event policy. All submitted and researched tech events are held in the verification queue until direct official organizer registration links and perk evidence are independently confirmed.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/suggest"
                  className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all"
                >
                  Submit an Event with Evidence
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-orbit-card/60 border border-orbit-border rounded-2xl p-12 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-border">
                <SearchX className="w-6 h-6 text-orbit-muted" />
              </div>
              <h3 className="font-display font-bold text-lg text-orbit-text">
                No events match your criteria
              </h3>
              <p className="text-xs text-orbit-muted mt-1.5 leading-relaxed">
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
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg"
                >
                  Reset All Filters
                </button>
                <Link
                  href="/suggest"
                  className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-orbit-text bg-orbit-surface border border-orbit-border"
                >
                  Suggest an Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bengaluru District Corridors */}
      <BengaluruRadarMap />

      {/* Trust & Verification Explainer */}
      <VerificationEngineExplainer />
    </div>
  );
}
