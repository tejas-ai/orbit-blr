"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OrbitEvent, EventFilters as FilterStateType } from "@/types/event";
import EventFiltersBar from "@/components/events/EventFilters";
import EventCard from "@/components/events/EventCard";
import EventCountdown from "@/components/events/EventCountdown";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { isHackathonEvent } from "@/lib/hackathons";
import { useLiveEvents } from "@/lib/useLiveEvents";
import { Compass, LayoutGrid, List, SearchX, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

interface ExploreClientProps {
  initialEvents: OrbitEvent[];
  directory: "events" | "hackathons";
}

export default function ExploreClient({ initialEvents, directory }: ExploreClientProps) {
  const liveEvents = useLiveEvents(initialEvents, directory);
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedEvents();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [clockNow, setClockNow] = useState(0);
  useEffect(() => { const update = () => setClockNow(Date.now()); update(); const timer = window.setInterval(update, 60_000); return () => window.clearInterval(timer); }, []);

  const [filters, setFilters] = useState<FilterStateType>({
    search: searchParams.get("q") || "",
    category: directory === "hackathons" ? "Hackathons" : (searchParams.get("category") as any) || "all",
    benefits: (searchParams.get("benefits") as any) || "all",
    dateFilter: (searchParams.get("date") as any) || "all",
    registrationStatus: (searchParams.get("status") as any) || "all",
    area: searchParams.get("area") || "all",
    venueType: (searchParams.get("venue") as any) || "all",
    sortBy: (searchParams.get("sort") as any) || "date_asc",
  });

  // Keep the UI in sync when navigation removes a filter from the URL.
  // The previous effect only applied truthy values, trapping users in Hackathons
  // even after navigating back to /explore.
  useEffect(() => {
    const category = (directory === "hackathons" ? "Hackathons" : searchParams.get("category") || "all") as FilterStateType["category"];
    const area = searchParams.get("area") || "all";
    const search = searchParams.get("q") || "";
    setFilters((prev) => {
      if (prev.category === category && prev.area === area && prev.search === search) return prev;
      return { ...prev, category, area, search };
    });
  }, [searchParams, directory]);

  const filteredEvents = useMemo(() => {
    // Defence-in-depth: never let a filter or query put a record
    // from the other directory back into this page.
    let result = liveEvents.filter((e) =>
      (directory === "hackathons" ? isHackathonEvent(e) : !isHackathonEvent(e)) &&
      (clockNow === 0 || new Date(e.end_at).getTime() > clockNow)
    );

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

    if (filters.category && filters.category !== "all" && directory === "events") {
      result = result.filter((e) => !isHackathonEvent(e) && e.category.toLowerCase() === filters.category!.toLowerCase());
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
            e.goodies_status === "confirmed" && e.certificate_status === "confirmed"
        );
      } else if (filters.benefits === "certificates_confirmed") {
        result = result.filter(
          (e) => e.certificate_status === "confirmed"
        );
      } else if (filters.benefits === "goodies_confirmed") {
        result = result.filter(
          (e) => e.goodies_status === "confirmed"
        );
      } else if (filters.benefits === "complimentary_food") {
        result = result.filter(
          (e) =>
            e.food_status === "complimentary_meals_confirmed" ||
            e.food_status === "refreshments_confirmed"
        );
      }
    }

    // Calendar shortcuts always use Bengaluru's local calendar, not UTC.
    if (filters.dateFilter && filters.dateFilter !== "all") {
      const localParts = (value: Date) => {
        const p = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
        }).formatToParts(value);
        const get = (key: string) => p.find(x => x.type === key)?.value || "";
        return { y: get("year"), m: get("month"), d: get("day"), weekday: get("weekday") };
      };
      const current = new Date(clockNow || Date.now());
      const today = localParts(current);
      const nextDay = localParts(new Date(current.getTime() + 86_400_000));
      result = result.filter((e) => {
        const startDate = new Date(e.start_at);
        const p = localParts(startDate);
        if (filters.dateFilter === "today") return p.y === today.y && p.m === today.m && p.d === today.d;
        if (filters.dateFilter === "tomorrow") return p.y === nextDay.y && p.m === nextDay.m && p.d === nextDay.d;
        if (filters.dateFilter === "weekend") return p.weekday === "Sat" || p.weekday === "Sun";
        if (filters.dateFilter === "next_7_days") return startDate.getTime() >= current.getTime() && startDate.getTime() <= current.getTime() + 7 * 86_400_000;
        if (filters.dateFilter === "this_month") return p.y === today.y && p.m === today.m;
        return true;
      });
    }

    // Fixed chronological sort in BOTH directories. No alternative ranking can obscure nearby events.
    result.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    return result;
  }, [liveEvents, filters, directory, clockNow]);

  const isHackathonMode = directory === "hackathons";

  return (
    <div className="space-y-4 sm:space-y-5 pt-0 pb-2 sm:pb-3 w-full">
      {/* Header */}
      <ScrollReveal direction="down" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-[#302B43] pb-3 pt-1 sm:pb-4 sm:pt-2 transition-colors">
        <div>
          {isHackathonMode ? (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Bengaluru Hackathons & Build Sprints</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
                Free Offline Hackathons in Bengaluru
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-1 max-w-2xl font-normal">
                Build prototypes, meet co-founders, and compete — 100% free offline student & developer hackathons with verified deadlines and eligibility.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] uppercase tracking-wider mb-1">
                <Compass className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
                <span>Verified Gathering Directory</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
                Explore Free Tech Events in Bengaluru
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-1 max-w-2xl font-normal">
                Filter through verified developer meetups, AI workshops and conferences with authentic event posters and ₹0 admission. Hackathons have their own dedicated directory.
              </p>
            </>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                viewMode === "grid"
                  ? "bg-white dark:bg-[#1D1B2C] text-[#6A38EB] dark:text-[#A78BFA] shadow-sm font-bold"
                  : "text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF]"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                viewMode === "list"
                  ? "bg-white dark:bg-[#1D1B2C] text-[#6A38EB] dark:text-[#A78BFA] shadow-sm font-bold"
                  : "text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF]"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Filter Component */}
      <EventFiltersBar
        filters={filters}
        onChange={setFilters}
        totalResults={filteredEvents.length}
        directory={directory}
        availableEvents={liveEvents.filter((e) => (directory === "hackathons" ? isHackathonEvent(e) : !isHackathonEvent(e)) && (clockNow === 0 || new Date(e.end_at).getTime() > clockNow))}
      />

      {/* Nearest upcoming event countdown, with no fabricated RSVP urgency. */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#302B43] bg-[#1D1B2C] px-3 py-2 text-xs text-[#CBD5E1]">
          <span>Next up: <strong className="text-[#F7F5FF]">{filteredEvents[0].name}</strong></span>
          <EventCountdown startAt={filteredEvents[0].start_at} endAt={filteredEvents[0].end_at} />
        </div>
      )}

      {/* Events Listing */}
      {filteredEvents.length > 0 ? (
        isHackathonMode && viewMode === "grid" ? (
          <div className="space-y-5 sm:space-y-6">
            {/* Dedicated Balanced Hackathon Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
              {filteredEvents.map((event, index) => (
                <ScrollReveal key={event.id} staggerIndex={index % 2}>
                  <EventCard
                    event={event}
                    isSaved={isSaved(event.id)}
                    onToggleSave={toggleSave}
                  />
                </ScrollReveal>
              ))}
            </div>

            {/* Hackathon Community Callout Card */}
            <ScrollReveal direction="down" className="max-w-5xl mx-auto rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-50 via-purple-50/50 to-white dark:from-[#2A1D0D] dark:via-[#1D1B2C] dark:to-[#171424] border border-amber-200/80 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Organizing an in-person Hackathon in Bengaluru?
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1]">
                  Get your offline hackathon independently verified and listed for thousands of student &amp; developer builders across Bengaluru.
                </p>
              </div>
              <Link
                href="/suggest"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white shadow-sm transition-all shrink-0 active:scale-95"
              >
                <span>Submit Hackathon</span>
              </Link>
            </ScrollReveal>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
                : "space-y-4"
            }
          >
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
        )
      ) : liveEvents.length === 0 ? (
        <div className="bg-white dark:bg-[#1D1B2C] border border-purple-100 dark:border-[#302B43] rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-[#151522] flex items-center justify-center mx-auto mb-4 border border-purple-200 dark:border-[#302B43]">
            <ShieldCheck className="w-6 h-6 text-[#6A38EB] dark:text-[#A78BFA]" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-950 dark:text-[#F7F5FF] font-serif">
            Strict Verification Active — Review Queue in Progress
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-2 leading-relaxed">
            All submitted community events are currently in the review queue awaiting direct organizer verification. We do not publish events with unconfirmed perks or unverified links.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/suggest"
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white shadow-sm transition-all"
            >
              Submit an Event with Evidence
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1D1B2C] border border-slate-200 dark:border-[#302B43] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#151522] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-[#302B43]">
            <SearchX className="w-6 h-6 text-slate-400 dark:text-[#CBD5E1]" />
          </div>
          <h3 className="font-bold text-lg text-slate-950 dark:text-[#F7F5FF] font-serif">
            No events match your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1.5 leading-relaxed">
            Try resetting your filters or exploring another neighborhood or category.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                setFilters({
                  search: "",
                  category: isHackathonMode ? "Hackathons" : "all",
                  benefits: "all",
                  dateFilter: "all",
                  registrationStatus: "all",
                  area: "all",
                  venueType: "all",
                  sortBy: "date_asc",
                })
              }
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white shadow-sm"
            >
              Reset All Filters
            </button>
            <Link
              href="/suggest"
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-[#CBD5E1] bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] hover:bg-slate-100 dark:hover:bg-[#1D1B2C]"
            >
              Suggest an Event
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
