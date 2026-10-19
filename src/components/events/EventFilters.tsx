"use client";

import React, { useState } from "react";
import { EventFilters as FilterState, EventCategory, RegistrationStatus, VenueType, CATEGORIES, BENGALURU_AREAS } from "@/types/event";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Gift,
  Award,
  Coffee,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  Building,
  ChevronDown,
  X,
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
    filters.category !== "all" ||
    filters.benefits !== "all" ||
    filters.dateFilter !== "all" ||
    filters.registrationStatus !== "all" ||
    filters.area !== "all" ||
    filters.venueType !== "all";

  return (
    <div className="w-full space-y-4 bg-orbit-card/80 backdrop-blur-md border border-orbit-border rounded-2xl p-4 md:p-6 shadow-card">
      {/* Top Search & Primary Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orbit-subtle" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Search events, topics (e.g. Gemini, Rust, eBPF), venues or organizers..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none focus:ring-1 focus:ring-orbit-signal text-sm text-orbit-text placeholder-orbit-subtle font-sans transition-all"
          />
          {filters.search && (
            <button
              onClick={() => update({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-orbit-subtle hover:text-orbit-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-orbit-muted shrink-0 hidden sm:inline">Sort:</span>
          <select
            value={filters.sortBy || "date_asc"}
            onChange={(e) => update({ sortBy: e.target.value as FilterState["sortBy"] })}
            className="px-3 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none transition-all cursor-pointer"
          >
            <option value="date_asc">Date: Upcoming Soonest</option>
            <option value="date_desc">Date: Later First</option>
            <option value="urgency">Urgency (Open RSVP First)</option>
            <option value="benefits">Highest Perks Score</option>
          </select>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-mono border transition-all ${
              showAdvanced || hasActiveFilters
                ? "bg-orbit-signal/15 text-orbit-signal border-orbit-signal/30"
                : "bg-orbit-surface text-orbit-muted border-orbit-border hover:border-orbit-borderLight"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-orbit-signal" />
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="p-2.5 rounded-xl bg-orbit-surface text-orbit-subtle hover:text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Carousel / Wrap */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
        <button
          onClick={() => update({ category: "all" })}
          className={`px-3 py-1.5 rounded-full transition-all shrink-0 border ${
            filters.category === "all" || !filters.category
              ? "bg-orbit-signal text-orbit-bg font-bold border-orbit-signal"
              : "bg-orbit-surface text-orbit-muted border-orbit-border hover:border-orbit-borderLight hover:text-orbit-text"
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => update({ category: cat })}
            className={`px-3 py-1.5 rounded-full transition-all shrink-0 border ${
              filters.category === cat
                ? "bg-orbit-signal text-orbit-bg font-bold border-orbit-signal"
                : "bg-orbit-surface text-orbit-muted border-orbit-border hover:border-orbit-borderLight hover:text-orbit-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quick Perk Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-orbit-border/60 text-xs font-mono">
        <span className="text-[11px] text-orbit-subtle uppercase tracking-wider font-semibold mr-1">
          Perks Filter:
        </span>

        <button
          onClick={() => update({ benefits: filters.benefits === "both_confirmed" ? "all" : "both_confirmed" })}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            filters.benefits === "both_confirmed"
              ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/40 font-bold"
              : "bg-orbit-surface/70 text-orbit-muted border-orbit-border hover:border-orbit-borderLight"
          }`}
        >
          <Sparkles className="w-3 h-3 text-orbit-signal" />
          Swag + Cert Confirmed
        </button>

        <button
          onClick={() => update({ benefits: filters.benefits === "goodies_confirmed" ? "all" : "goodies_confirmed" })}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            filters.benefits === "goodies_confirmed"
              ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/40 font-bold"
              : "bg-orbit-surface/70 text-orbit-muted border-orbit-border hover:border-orbit-borderLight"
          }`}
        >
          <Gift className="w-3 h-3 text-orbit-signal" />
          Confirmed Swag
        </button>

        <button
          onClick={() => update({ benefits: filters.benefits === "certificates_confirmed" ? "all" : "certificates_confirmed" })}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            filters.benefits === "certificates_confirmed"
              ? "bg-orbit-secondary/25 text-orbit-secondary border-orbit-secondary/40 font-bold"
              : "bg-orbit-surface/70 text-orbit-muted border-orbit-border hover:border-orbit-borderLight"
          }`}
        >
          <Award className="w-3 h-3 text-orbit-secondary" />
          Confirmed Certificate
        </button>

        <button
          onClick={() => update({ benefits: filters.benefits === "complimentary_food" ? "all" : "complimentary_food" })}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
            filters.benefits === "complimentary_food"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
              : "bg-orbit-surface/70 text-orbit-muted border-orbit-border hover:border-orbit-borderLight"
          }`}
        >
          <Coffee className="w-3 h-3 text-emerald-400" />
          Complimentary Food / Tea
        </button>
      </div>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <div className="pt-4 mt-2 border-t border-orbit-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {/* Date Filter */}
          <div>
            <label className="text-[11px] font-mono text-orbit-muted flex items-center gap-1.5 mb-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-orbit-signal" />
              <span>Event Date</span>
            </label>
            <select
              value={filters.dateFilter || "all"}
              onChange={(e) => update({ dateFilter: e.target.value as FilterState["dateFilter"] })}
              className="w-full px-3 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="weekend">This Weekend</option>
              <option value="next_7_days">Next 7 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          {/* Bengaluru Area Filter */}
          <div>
            <label className="text-[11px] font-mono text-orbit-muted flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-orbit-highlight" />
              <span>Bengaluru Tech Area</span>
            </label>
            <select
              value={filters.area || "all"}
              onChange={(e) => update({ area: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="all">All Bengaluru Hubs</option>
              {BENGALURU_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Status Filter */}
          <div>
            <label className="text-[11px] font-mono text-orbit-muted flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registration Status</span>
            </label>
            <select
              value={filters.registrationStatus || "all"}
              onChange={(e) => update({ registrationStatus: e.target.value as RegistrationStatus | "all" })}
              className="w-full px-3 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="all">Any Status</option>
              <option value="open">Registration Open</option>
              <option value="approval_required">Approval Required</option>
              <option value="waitlist">Waitlist Active</option>
              <option value="full">Capacity Full</option>
              <option value="closed">Closed</option>
              <option value="not_yet_open">Not Yet Open</option>
            </select>
          </div>

          {/* Venue Type Filter */}
          <div>
            <label className="text-[11px] font-mono text-orbit-muted flex items-center gap-1.5 mb-1.5">
              <Building className="w-3.5 h-3.5 text-orbit-secondary" />
              <span>Venue Category</span>
            </label>
            <select
              value={filters.venueType || "all"}
              onChange={(e) => update({ venueType: e.target.value as VenueType | "all" })}
              className="w-full px-3 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="all">All Venue Types</option>
              <option value="Technology HQ / Campus">Technology HQ / Campus (Google, Amazon, etc.)</option>
              <option value="Coworking Space">Coworking Space (BHIVE, WeWork, Draper)</option>
              <option value="University / Institute">University / Institute (IISc, IIIT)</option>
              <option value="Conference Centre">Conference Centre</option>
              <option value="Hotel / Auditorium">Hotel / Auditorium</option>
            </select>
          </div>
        </div>
      )}

      {/* Result Count Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-orbit-muted pt-1">
        <div>
          Showing <span className="font-bold text-orbit-signal">{totalResults}</span> verified free event{totalResults === 1 ? "" : "s"}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-orbit-signal hover:underline flex items-center gap-1"
          >
            Clear active filters
          </button>
        )}
      </div>
    </div>
  );
}
