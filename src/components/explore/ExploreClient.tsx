"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { OrbitEvent, EventFilters as FilterStateType } from "@/types/event";
import EventFiltersBar from "@/components/events/EventFilters";
import EventCard from "@/components/events/EventCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
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

  // Keep the UI in sync when navigation removes a filter from the URL.
  // The previous effect only applied truthy values, trapping users in Hackathons
  // even after navigating back to /explore.
  useEffect(() => {
    const category = (searchParams.get("category") || "all") as FilterStateType["category"];
    const area = searchParams.get("area") || "all";
    const search = searchParams.get("q") || "";
    setFilters((prev) => {
      if (prev.category === category && prev.area === area && prev.search === search) return prev;
      return { ...prev, category, area, search };
    });
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
    <div className="space-y-6 sm:space-y-8 py-2 pb-20 lg:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <ScrollReveal direction="down" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-[#302B43] pb-6 pt-4 transition-colors">
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
                Filter through verified developer meetups, AI workshops, and hackathons with authentic event posters and ₹0 admission.
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
      />

      {/* Events Listing */}
      {filteredEvents.length > 0 ? (
        filters.category === "Hackathons" && viewMode === "grid" ? (
          <div className="space-y-8">
            {/* Dedicated Balanced Hackathon Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
      ) : initialEvents.length === 0 ? (
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
                  category: "all",
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
