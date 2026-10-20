"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OrbitEvent, EventFilters as FilterStateType } from "@/types/event";
import EventFiltersBar from "@/components/events/EventFilters";
import EventCard from "@/components/events/EventCard";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { isHackathonEvent } from "@/lib/hackathons";
import { Compass, LayoutGrid, List, SearchX, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

interface ExploreClientProps {
  initialEvents: OrbitEvent[];
}

export default function ExploreClient({ initialEvents }: ExploreClientProps) {
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedEvents();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [filters, setFilters] = useState<FilterStateType>({
    search: searchParams.get("q") || "",
    category: (searchParams.get("category") as any) || "all",
    benefits: (searchParams.get("benefits") as any) || "all",
    dateFilter: (searchParams.get("date") as any) || "all",
    registrationStatus: (searchParams.get("status") as any) || "all",
    area: searchParams.get("area") || "all",
    venueType: (searchParams.get("venue") as any) || "all",
    sortBy: (searchParams.get("sort") as any) || "date_asc",
  });

  // Sync with searchParams if navigated from external link or hackathon button
  useEffect(() => {
    const areaParam = searchParams.get("area");
    const catParam = searchParams.get("category");
    const qParam = searchParams.get("q");
    if (areaParam) setFilters((prev) => ({ ...prev, area: areaParam }));
    if (catParam) setFilters((prev) => ({ ...prev, category: catParam as any }));
    if (qParam) setFilters((prev) => ({ ...prev, search: qParam }));
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    let result = [...initialEvents];

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

    if (filters.category && filters.category !== "all") {
      if (filters.category === "Hackathons") {
        result = result.filter((e) => isHackathonEvent(e));
      } else {
        result = result.filter((e) => e.category.toLowerCase() === filters.category!.toLowerCase());
      }
    }

    if (filters.area && filters.area !== "all") {
      result = result.filter((e) => e.area.toLowerCase() === filters.area!.toLowerCase());
    }

    if (filters.registrationStatus && filters.registrationStatus !== "all") {
      result = result.filter((e) => e.registration_status === filters.registrationStatus);
    }

    if (filters.venueType && filters.venueType !== "all") {
      result = result.filter((e) => e.venue_type === filters.venueType);
    }

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

  const isHackathonMode = filters.category === "Hackathons";

  return (
    <div className="space-y-8 py-4 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orbit-border/80 pb-6">
        <div>
          {isHackathonMode ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Bengaluru Hackathons & Build Sprints</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight uppercase">
                HACKATHONS IN BENGALURU.
              </h1>
              <p className="text-xs sm:text-sm text-orbit-muted mt-1.5 font-normal max-w-2xl font-sans">
                Build cool things, meet creators, and compete — only genuinely free in-person student & developer hackathons in Bengaluru.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5 text-orbit-signal" />
                <span>Bengaluru Verified Gallery</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight uppercase">
                EXPLORE FREE TECH EVENTS.
              </h1>
              <p className="text-xs sm:text-sm text-orbit-muted mt-1.5 font-normal max-w-2xl font-sans">
                Filter through verified developer meetups, AI workshops, and founder mixers with authentic event posters and 100% free admission.
              </p>
            </>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-orbit-card border border-orbit-border p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                viewMode === "grid"
                  ? "bg-orbit-surface text-orbit-signal border border-orbit-border"
                  : "text-orbit-muted hover:text-orbit-text"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg text-xs font-mono transition-colors ${
                viewMode === "list"
                  ? "bg-orbit-surface text-orbit-signal border border-orbit-border"
                  : "text-orbit-muted hover:text-orbit-text"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <EventFiltersBar
        filters={filters}
        onChange={setFilters}
        totalResults={filteredEvents.length}
      />

      {/* Events Listing */}
      {filteredEvents.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              : "space-y-4"
          }
        >
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
        <div className="bg-orbit-card/60 border border-orbit-signal/30 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-glow">
          <div className="w-12 h-12 rounded-full bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-signal/40">
            <ShieldCheck className="w-6 h-6 text-orbit-signal" />
          </div>
          <h3 className="font-display font-bold text-xl text-orbit-text">
            Strict Verification Active — Review Queue in Progress
          </h3>
          <p className="text-xs sm:text-sm text-orbit-muted mt-2 leading-relaxed font-sans">
            All submitted community events are currently in the review queue awaiting direct organizer verification. We do not publish events with unconfirmed perks or unverified links.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/suggest"
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg shadow-glow hover:bg-orbit-signalHover transition-all"
            >
              Submit an Event with Evidence
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-orbit-card/60 border border-orbit-border rounded-2xl p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-border">
            <SearchX className="w-6 h-6 text-orbit-muted" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            No events match your criteria
          </h3>
          <p className="text-xs text-orbit-muted mt-1.5 leading-relaxed font-sans">
            Try resetting your filters or exploring another category or area.
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
  );
}
