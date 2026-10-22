"use client";

import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, CalendarDays, MapPin, Gift, ChevronDown } from "lucide-react";
import type { EventFilters as FilterState, OrbitEvent } from "@/types/event";

type Directory = "events" | "hackathons";
interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalResults: number;
  directory?: Directory;
  availableEvents?: OrbitEvent[];
}

const control = "min-w-0 w-full rounded-xl border border-[#36314D] bg-[#151522] px-3 py-2.5 text-xs sm:text-sm text-[#F7F5FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";
const pill = "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";

export default function EventFiltersBar({ filters, onChange, totalResults, directory = "events", availableEvents = [] }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);
  const isHackathon = directory === "hackathons";
  const category = isHackathon ? "Hackathons" : (filters.category || "all");
  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial, category: isHackathon ? "Hackathons" : (partial.category ?? filters.category), sortBy: "date_asc" });
  };
  const reset = () => onChange({
    search: "", category: isHackathon ? "Hackathons" : "all", benefits: "all", dateFilter: "all",
    registrationStatus: "all", area: "all", venueType: "all", sortBy: "date_asc",
  });

  const categories = useMemo(() => Array.from(new Set(
    availableEvents.filter(e => !isHackathon && e.category !== "Hackathons").map(e => e.category)
  )).sort((a, b) => a.localeCompare(b)), [availableEvents, isHackathon]);
  const areas = useMemo(() => Array.from(new Set(
    availableEvents.map(e => e.area).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b)), [availableEvents]);

  const activeCount = [
    !!filters.search?.trim(), !isHackathon && category !== "all",
    filters.benefits && filters.benefits !== "all",
    filters.dateFilter && filters.dateFilter !== "all",
    filters.registrationStatus && filters.registrationStatus !== "all",
    filters.area && filters.area !== "all",
  ].filter(Boolean).length;
  const dates: Array<{ value: NonNullable<FilterState["dateFilter"]>; label: string }> = [
    { value: "all", label: "Any date" },
    { value: "next_7_days", label: "Next 7 days" },
    { value: "weekend", label: "Weekends" },
    { value: "this_month", label: "This month" },
  ];

  return (
    <section aria-label={isHackathon ? "Filter hackathons" : "Filter tech events"} className="w-full min-w-0 rounded-2xl border border-[#36314D] bg-[#1D1B2C] p-3 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">{isHackathon ? "Search hackathons" : "Search events"}</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A9A5BC]" aria-hidden="true" />
          <input
            type="search"
            value={filters.search || ""}
            onChange={e => update({ search: e.target.value })}
            placeholder={isHackathon ? "Search hackathons, teams, venues…" : "Search events, AI, speakers, venues…"}
            className={control + " pl-10 pr-8"}
          />
        </label>
        <button
          type="button"
          onClick={() => setMoreOpen(value => !value)}
          aria-expanded={moreOpen}
          aria-controls="orbit-more-filters"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#36314D] bg-[#151522] px-4 py-2.5 text-xs font-semibold text-[#F7F5FF] hover:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          More filters {activeCount > 0 ? `(${activeCount})` : ""}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <CalendarDays className="h-3.5 w-3.5 text-violet-300 mr-1" aria-hidden="true" />
        {dates.map(option => (
          <button key={option.value} type="button" aria-pressed={(filters.dateFilter || "all") === option.value}
            onClick={() => update({ dateFilter: option.value })}
            className={pill + ((filters.dateFilter || "all") === option.value
              ? " border-violet-500 bg-violet-600 text-white"
              : " border-[#36314D] bg-[#151522] text-[#CBD5E1] hover:border-violet-500")}
          >{option.label}</button>
        ))}
        <span className="ml-auto text-[11px] text-[#CBD5E1] whitespace-nowrap" aria-live="polite">
          {totalResults} {isHackathon ? "hackathons" : "events"} · Soonest first
        </span>
      </div>

      {moreOpen && (
        <div id="orbit-more-filters" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border-t border-[#36314D] pt-3">
          {!isHackathon && (
            <label className="min-w-0 space-y-1">
              <span className="text-[11px] text-[#CBD5E1]">Topic</span>
              <select className={control} value={category}
                onChange={e => update({ category: e.target.value as FilterState["category"] })}>
                <option value="all">All topics</option>
                {categories.map(item => { const key = String(item).toLowerCase(); return <option key={item} value={item}>{key === "ai" ? "AI & ML" : key === "security" ? "Cybersecurity" : item.charAt(0).toUpperCase() + item.slice(1)}</option>; })}
              </select>
            </label>
          )}
          <label className="min-w-0 space-y-1">
            <span className="text-[11px] text-[#CBD5E1] flex gap-1 items-center"><MapPin className="h-3 w-3" aria-hidden="true" />Location</span>
            <select className={control} value={filters.area || "all"} onChange={e => update({ area: e.target.value })}>
              <option value="all">Anywhere in Bengaluru</option>
              {areas.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="min-w-0 space-y-1">
            <span className="text-[11px] text-[#CBD5E1]">Registration</span>
            <select className={control} value={filters.registrationStatus || "all"} onChange={e => update({ registrationStatus: e.target.value as FilterState["registrationStatus"] })}>
              <option value="all">Any status</option>
              <option value="open">Registration open</option>
              <option value="approval_required">Host approval</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </label>
          <label className="min-w-0 space-y-1">
            <span className="text-[11px] text-[#CBD5E1] flex gap-1 items-center"><Gift className="h-3 w-3" aria-hidden="true" />Verified benefits</span>
            <select className={control} value={filters.benefits || "all"} onChange={e => update({ benefits: e.target.value as FilterState["benefits"] })}>
              <option value="all">Any benefits</option>
              <option value="goodies_confirmed">Confirmed attendee goodies</option>
              <option value="certificates_confirmed">Confirmed attendee certificates</option>
              <option value="both_confirmed">Both confirmed</option>
              <option value="complimentary_food">Confirmed food</option>
            </select>
          </label>
          {activeCount > 0 && (
            <button type="button" onClick={reset} className="flex items-center justify-center gap-1.5 self-end rounded-xl border border-[#36314D] px-4 py-2.5 text-xs text-[#CBD5E1] hover:text-white">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      )}
      {!moreOpen && activeCount > 0 && (
        <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-300 hover:text-white">
          <X className="h-3 w-3" aria-hidden="true" /> Clear filters
        </button>
      )}
    </section>
  );
}
