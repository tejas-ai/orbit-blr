"use client";

import React, { useState } from "react";
import {
  EventFilters as FilterState,
  EventCategory,
  RegistrationStatus,
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
  X,
  Check,
  Zap,
} from "lucide-react";

interface EventFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

export default function EventFiltersBar({ filters, onChange, totalResults }: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
    <div className="w-full max-w-full space-y-4 min-w-0">
      {/* 1. DISTRICT-STYLE SEARCH & PRIMARY CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3 w-full max-w-full min-w-0">
        {/* Modern Search Input with Instant Clear */}
        <div className="relative flex-1 group min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search events, topics (e.g. Kotlin, LLMs, GenAI), venues, or tech hubs..."
            className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[#130D26] border border-purple-500/20 focus:border-purple-500/70 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-xs sm:text-sm text-white placeholder-slate-500 font-sans transition-all shadow-sm"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 w-full md:w-auto shrink-0 min-w-0">
          {/* Bengaluru Area Quick Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-0">
            <select
              value={filters.area || "all"}
              onChange={(e) => update({ area: e.target.value })}
              className="w-full pl-7 pr-7 py-2.5 sm:py-3 rounded-2xl bg-[#130D26] border border-purple-500/20 text-[11px] sm:text-xs font-mono text-slate-300 focus:border-purple-500 focus:outline-none transition-all cursor-pointer shadow-sm appearance-none truncate"
            >
              <option value="all">📍 All Bengaluru Hubs</option>
              {BENGALURU_AREAS.map((a) => (
                <option key={a} value={a}>
                  📍 {a}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-purple-400 pointer-events-none" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative flex-1 sm:flex-initial min-w-0">
            <select
              value={filters.sortBy || "date_asc"}
              onChange={(e) => update({ sortBy: e.target.value as FilterState["sortBy"] })}
              className="w-full pl-3 pr-7 py-2.5 sm:py-3 rounded-2xl bg-[#130D26] border border-purple-500/20 text-[11px] sm:text-xs font-mono text-slate-300 focus:border-purple-500 focus:outline-none transition-all cursor-pointer shadow-sm appearance-none truncate"
            >
              <option value="date_asc">📅 Soonest</option>
              <option value="date_desc">📅 Later First</option>
              <option value="urgency">⚡ Open RSVP</option>
              <option value="benefits">🎁 Top Perks</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>

          {/* Advanced Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-2xl text-[11px] sm:text-xs font-mono border transition-all shadow-sm shrink-0 ${
              showAdvanced || hasActiveFilters
                ? "bg-purple-600/30 text-purple-200 border-purple-500/50 font-bold"
                : "bg-[#130D26] text-slate-400 border-purple-500/20 hover:border-purple-500/40 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-purple-400" />}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-2.5 sm:p-3 rounded-2xl bg-[#130D26] text-slate-400 hover:text-white border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-sm shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DISTRICT-STYLE CATEGORY HORIZONTAL PILLS SCROLLER */}
      <div className="w-full max-w-full overflow-hidden min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono w-full min-w-0">
          <button
            type="button"
            onClick={() => update({ category: "all" })}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all shrink-0 border text-xs font-medium ${
              filters.category === "all" || !filters.category
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold border-purple-500 shadow-sm"
                : "bg-[#130D26] text-slate-400 border-purple-500/20 hover:border-purple-500/40 hover:text-white"
            }`}
          >
            All Tech ({totalResults})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => update({ category: cat })}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all shrink-0 border text-xs font-medium flex items-center gap-1.5 ${
                filters.category?.toLowerCase() === cat.toLowerCase()
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold border-purple-500 shadow-sm"
                  : cat === "Hackathons"
                  ? "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:border-amber-400"
                  : "bg-[#130D26] text-slate-400 border-purple-500/20 hover:border-purple-500/40 hover:text-white"
              }`}
            >
              {cat === "Hackathons" && <Zap className="w-3.5 h-3.5 text-amber-400" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. QUICK DATE CHIPS */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
          When:
        </span>
        {dateShortcuts.map((ds) => (
          <button
            key={ds.id}
            type="button"
            onClick={() => update({ dateFilter: ds.id as any })}
            className={`px-2.5 py-1 sm:px-3 rounded-xl border transition-all text-xs ${
              (filters.dateFilter || "all") === ds.id
                ? "bg-purple-600/30 text-purple-200 border-purple-500/50 font-bold"
                : "bg-[#130D26] text-slate-400 border-purple-500/20 hover:border-purple-500/40 hover:text-white"
            }`}
          >
            {ds.label}
          </button>
        ))}
      </div>

      {/* 4. EXPANDABLE ADVANCED FILTERS (Perks, RSVP status, etc.) */}
      {showAdvanced && (
        <div className="p-4 sm:p-5 rounded-2xl bg-orbit-card/95 border border-orbit-border space-y-4 shadow-card">
          <div className="flex items-center justify-between border-b border-orbit-border/60 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-orbit-text font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orbit-signal" />
              <span>Verified Attendee Perks Filter</span>
            </span>
            <span className="text-[11px] font-mono text-orbit-subtle">
              Showing verified amenities
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() =>
                update({
                  benefits: filters.benefits === "both_confirmed" ? "all" : "both_confirmed",
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                filters.benefits === "both_confirmed"
                  ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/50 font-bold shadow-glow"
                  : "bg-orbit-surface/80 text-orbit-muted border-orbit-border hover:border-orbit-signal/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orbit-signal" />
              <span>Goodies + Certificate Confirmed</span>
            </button>

            <button
              type="button"
              onClick={() =>
                update({
                  benefits: filters.benefits === "goodies_confirmed" ? "all" : "goodies_confirmed",
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                filters.benefits === "goodies_confirmed"
                  ? "bg-orbit-pink/20 text-orbit-pink border-orbit-pink/50 font-bold"
                  : "bg-orbit-surface/80 text-orbit-muted border-orbit-border hover:border-orbit-pink/30"
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-orbit-pink" />
              <span>Confirmed Swag</span>
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                filters.benefits === "certificates_confirmed"
                  ? "bg-orbit-secondary/25 text-orbit-secondary border-orbit-secondary/50 font-bold"
                  : "bg-orbit-surface/80 text-orbit-muted border-orbit-border hover:border-orbit-secondary/30"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-orbit-secondary" />
              <span>Confirmed Certificate</span>
            </button>

            <button
              type="button"
              onClick={() =>
                update({
                  benefits:
                    filters.benefits === "complimentary_food" ? "all" : "complimentary_food",
                })
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                filters.benefits === "complimentary_food"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold"
                  : "bg-orbit-surface/80 text-orbit-muted border-orbit-border hover:border-emerald-500/30"
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-emerald-400" />
              <span>Complimentary Meals / Drinks</span>
            </button>
          </div>

          {/* Registration Status Row */}
          <div className="pt-2 border-t border-orbit-border/60 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-[11px] text-orbit-subtle uppercase tracking-wider font-semibold mr-1">
              RSVP Status:
            </span>
            <button
              type="button"
              onClick={() =>
                update({
                  registrationStatus: filters.registrationStatus === "open" ? "all" : "open",
                })
              }
              className={`px-3 py-1 rounded-xl border transition-all ${
                filters.registrationStatus === "open"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold"
                  : "bg-orbit-surface text-orbit-muted border-orbit-border"
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
              className={`px-3 py-1 rounded-xl border transition-all ${
                filters.registrationStatus === "approval_required"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                  : "bg-orbit-surface text-orbit-muted border-orbit-border"
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
              className={`px-3 py-1 rounded-xl border transition-all ${
                filters.registrationStatus === "waitlist"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                  : "bg-orbit-surface text-orbit-muted border-orbit-border"
              }`}
            >
              Waitlist Active
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
