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
    <div className="w-full space-y-4">
      {/* 1. DISTRICT-STYLE SEARCH & PRIMARY CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Modern Search Input with Instant Clear */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orbit-muted group-focus-within:text-orbit-signal transition-colors" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search events, topics (e.g. Kotlin, LLMs, GenAI), venues, or tech hubs..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-orbit-card/90 border border-orbit-border focus:border-orbit-signal/70 focus:outline-none focus:ring-2 focus:ring-orbit-signal/20 text-sm text-orbit-text placeholder-orbit-subtle font-sans transition-all shadow-card"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-orbit-subtle hover:text-orbit-text hover:bg-orbit-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* Bengaluru Area Quick Dropdown */}
          <div className="relative">
            <select
              value={filters.area || "all"}
              onChange={(e) => update({ area: e.target.value })}
              className="pl-8 pr-8 py-3 rounded-2xl bg-orbit-card border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none transition-all cursor-pointer shadow-card appearance-none"
            >
              <option value="all">📍 All Bengaluru Hubs</option>
              {BENGALURU_AREAS.map((a) => (
                <option key={a} value={a}>
                  📍 {a}
                </option>
              ))}
            </select>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orbit-sunset pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-orbit-subtle pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={filters.sortBy || "date_asc"}
              onChange={(e) => update({ sortBy: e.target.value as FilterState["sortBy"] })}
              className="pl-3 pr-8 py-3 rounded-2xl bg-orbit-card border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none transition-all cursor-pointer shadow-card appearance-none"
            >
              <option value="date_asc">📅 Date: Upcoming Soonest</option>
              <option value="date_desc">📅 Date: Later First</option>
              <option value="urgency">⚡ Urgency: Open RSVP First</option>
              <option value="benefits">🎁 Perks: Highest Verified Perks</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-orbit-subtle pointer-events-none" />
          </div>

          {/* Advanced Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-xs font-mono border transition-all shadow-card ${
              showAdvanced || hasActiveFilters
                ? "bg-orbit-signal/15 text-orbit-signal border-orbit-signal/50 font-bold"
                : "bg-orbit-card text-orbit-muted border-orbit-border hover:border-orbit-signal/40 hover:text-orbit-text"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-orbit-signal" />}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-3 rounded-2xl bg-orbit-card text-orbit-subtle hover:text-orbit-text border border-orbit-border hover:border-orbit-signal/40 transition-all shadow-card"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. DISTRICT-STYLE CATEGORY HORIZONTAL PILLS SCROLLER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-mono">
        <button
          type="button"
          onClick={() => update({ category: "all" })}
          className={`px-4 py-2 rounded-full transition-all shrink-0 border text-xs font-medium ${
            filters.category === "all" || !filters.category
              ? "bg-gradient-to-r from-orbit-signal to-orbit-signalHover text-orbit-bg font-extrabold border-orbit-signal shadow-glow"
              : "bg-orbit-card text-orbit-muted border-orbit-border hover:border-orbit-signal/40 hover:text-white"
          }`}
        >
          All Tech ({totalResults})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => update({ category: cat })}
            className={`px-4 py-2 rounded-full transition-all shrink-0 border text-xs font-medium flex items-center gap-1.5 ${
              filters.category?.toLowerCase() === cat.toLowerCase()
                ? "bg-gradient-to-r from-orbit-signal to-orbit-signalHover text-orbit-bg font-extrabold border-orbit-signal shadow-glow"
                : cat === "Hackathons"
                ? "bg-amber-950/40 text-amber-300 border-amber-500/40 hover:border-amber-400"
                : "bg-orbit-card text-orbit-muted border-orbit-border hover:border-orbit-signal/40 hover:text-white"
            }`}
          >
            {cat === "Hackathons" && <Zap className="w-3.5 h-3.5 text-amber-400" />}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* 3. QUICK DATE CHIPS */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-[11px] text-orbit-subtle uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5 text-orbit-pink" />
          When:
        </span>
        {dateShortcuts.map((ds) => (
          <button
            key={ds.id}
            type="button"
            onClick={() => update({ dateFilter: ds.id as any })}
            className={`px-3 py-1 rounded-xl border transition-all text-xs ${
              (filters.dateFilter || "all") === ds.id
                ? "bg-orbit-pink/20 text-orbit-pink border-orbit-pink/50 font-bold"
                : "bg-orbit-surface/70 text-orbit-muted border-orbit-border hover:border-orbit-pink/30 hover:text-white"
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
