"use client";

import React, { useState, useRef } from "react";
import {
  EventFilters as FilterState,
  CATEGORIES,
  BENGALURU_AREAS,
} from "@/types/event";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Gift,
  Award,
  Coffee,
  Calendar as CalendarIcon,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  ArrowUpDown,
} from "lucide-react";

interface EventFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

export default function EventFiltersBar({ filters, onChange, totalResults }: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<FilterState>) => {
    onChange({ ...filters, ...partial });
  };

  const resetFilters = () => {
    onChange({
      search: "",
      category: "all",
      benefits: "all",
      dateFilter: "all",
      registrationStatus: "all",
      area: "all",
      venueType: "all",
      sortBy: "date_asc",
    });
  };

  const handleScrollCategories = (direction: "left" | "right") => {
    if (scrollerRef.current) {
      const scrollAmount = direction === "left" ? -220 : 220;
      scrollerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.category && filters.category !== "all") ||
    (filters.benefits && filters.benefits !== "all") ||
    (filters.dateFilter && filters.dateFilter !== "all") ||
    (filters.registrationStatus && filters.registrationStatus !== "all") ||
    (filters.area && filters.area !== "all");

  const dateShortcuts = [
    { id: "all", label: "All Dates" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "weekend", label: "This Weekend" },
    { id: "next_7_days", label: "Next 7 Days" },
    { id: "this_month", label: "This Month" },
  ];

  return (
    <div className="w-full max-w-full space-y-3 min-w-0">
      {/* ============================================================== */}
      {/* 1. SEARCH DOCK: STRUCTURED RESPONSIVE ROWS                      */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-4 shadow-sm space-y-2.5">
        {/* ROW 1: FULL-WIDTH SEARCH INPUT */}
        <div className="relative w-full group min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#6A38EB] transition-colors" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search meetups, hackathons, AI topics, venues..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-[#6A38EB] focus:outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all shadow-inner"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ROW 2: READABLE LOCATION & SORTING CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
          {/* Bengaluru Area Dropdown */}
          <div className="relative w-full min-w-0">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.area || "all"}
              onChange={(e) => update({ area: e.target.value })}
              aria-label="Filter by Bengaluru neighborhood"
              className="w-full pl-8 pr-7 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:border-[#6A38EB] focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              <option value="all">All Hubs (Bengaluru)</option>
              {BENGALURU_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Selector Dropdown */}
          <div className="relative w-full min-w-0">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.sortBy || "date_asc"}
              onChange={(e) => update({ sortBy: e.target.value as FilterState["sortBy"] })}
              aria-label="Sort events"
              className="w-full pl-8 pr-7 py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:border-[#6A38EB] focus:outline-none cursor-pointer appearance-none transition-colors"
            >
              <option value="date_asc">Soonest First</option>
              <option value="date_desc">Later First</option>
              <option value="urgency">RSVP Priority</option>
              <option value="benefits">Confirmed Perks</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* ROW 3: FILTER ACTIONS (Perks toggle and Reset button) */}
        <div className="flex items-center justify-between gap-2 w-full pt-0.5">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showAdvanced || hasActiveFilters
                ? "bg-purple-50 text-[#6A38EB] border-purple-200 font-bold"
                : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6A38EB]" />
            <span>{showAdvanced ? "Hide Perks Filter" : "Filter by Perks"}</span>
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#6A38EB]" />}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* ROW 4: CATEGORY CHIPS (HORIZONTALLY SCROLLABLE)               */}
        {/* ============================================================== */}
        <div className="pt-2.5 border-t border-slate-100">
          <div className="relative flex items-center">
            {/* Left Arrow */}
            <button
              type="button"
              onClick={() => handleScrollCategories("left")}
              aria-label="Scroll categories left"
              className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 shadow-sm items-center justify-center mr-1 transition-all z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Left gradient fade cue */}
            <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />

            {/* Horizontal Scroller */}
            <div
              ref={scrollerRef}
              role="tablist"
              aria-label="Filter categories"
              className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 scroll-smooth snap-x touch-pan-x"
            >
              <button
                type="button"
                role="tab"
                aria-selected={filters.category === "all" || !filters.category}
                onClick={() => update({ category: "all" })}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all shrink-0 text-xs font-bold shadow-sm snap-start ${
                  filters.category === "all" || !filters.category
                    ? "bg-[#6A38EB] text-white shadow-purple-500/25 scale-[1.02]"
                    : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-purple-50/40 hover:border-purple-300"
                }`}
              >
                All Gatherings ({totalResults})
              </button>

              {CATEGORIES.map((cat) => {
                const isHack = cat === "Hackathons";
                const isActive = filters.category?.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => update({ category: cat })}
                    className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all shrink-0 text-xs font-bold flex items-center gap-1.5 shadow-sm snap-start ${
                      isActive
                        ? "bg-[#6A38EB] text-white shadow-purple-500/25 scale-[1.02]"
                        : isHack
                        ? "bg-amber-50/90 text-amber-900 border border-amber-200 hover:bg-amber-100/60"
                        : "bg-slate-50 text-slate-700 border border-slate-200/80 hover:bg-purple-50/40 hover:border-purple-300"
                    }`}
                  >
                    {isHack && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Right gradient fade cue */}
            <div className="hidden sm:block absolute right-8 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />

            {/* Right Arrow */}
            <button
              type="button"
              onClick={() => handleScrollCategories("right")}
              aria-label="Scroll categories right"
              className="hidden sm:flex shrink-0 w-7 h-7 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 shadow-sm items-center justify-center ml-1 transition-all z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ROW 5: DATE FILTERS (WRAPPING WITHOUT CLIPPING)               */}
        {/* ============================================================== */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5 text-[#6A38EB]" />
            When:
          </span>
          {dateShortcuts.map((ds) => (
            <button
              key={ds.id}
              type="button"
              onClick={() => update({ dateFilter: ds.id as any })}
              className={`px-3 py-1 rounded-full border transition-all text-xs font-medium whitespace-nowrap ${
                (filters.dateFilter || "all") === ds.id
                  ? "bg-purple-50 text-[#6A38EB] border-purple-200 font-bold"
                  : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {ds.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* EXPANDABLE PERKS DRAWER (WHEN ACTIVATED)                       */}
      {/* ============================================================== */}
      {showAdvanced && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#6A38EB]" />
              <span>Filter by Confirmed Attendee Perks</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Only shows organizer-confirmed amenities
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                update({
                  benefits:
                    filters.benefits === "complimentary_food" ? "all" : "complimentary_food",
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                filters.benefits === "complimentary_food"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confirmed Meals / Snacks</span>
            </button>

            <button
              type="button"
              onClick={() =>
                update({
                  benefits: filters.benefits === "goodies_confirmed" ? "all" : "goodies_confirmed",
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                filters.benefits === "goodies_confirmed"
                  ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              <span>Confirmed Swag Kits</span>
            </button>

            <button
              type="button"
              onClick={() =>
                update({
                  benefits:
                    filters.benefits === "certificates_confirmed"
                      ? "all"
                      : "certificates_confirmed",
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                filters.benefits === "certificates_confirmed"
                  ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Confirmed Certificates</span>
            </button>
          </div>

          {/* Registration Status Row */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
              RSVP Status:
            </span>
            <button
              type="button"
              onClick={() =>
                update({
                  registrationStatus: filters.registrationStatus === "open" ? "all" : "open",
                })
              }
              className={`px-3 py-1 rounded-full border transition-all ${
                filters.registrationStatus === "open"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              RSVP Open
            </button>
            <button
              type="button"
              onClick={() =>
                update({
                  registrationStatus:
                    filters.registrationStatus === "approval_required"
                      ? "all"
                      : "approval_required",
                })
              }
              className={`px-3 py-1 rounded-full border transition-all ${
                filters.registrationStatus === "approval_required"
                  ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Approval Required
            </button>
            <button
              type="button"
              onClick={() =>
                update({
                  registrationStatus:
                    filters.registrationStatus === "waitlist" ? "all" : "waitlist",
                })
              }
              className={`px-3 py-1 rounded-full border transition-all ${
                filters.registrationStatus === "waitlist"
                  ? "bg-purple-50 text-[#6A38EB] border-purple-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              Waitlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
