"use client";

import React from "react";
import Link from "next/link";
import { OrbitEvent } from "@/types/event";
import {
  RegistrationBadge,
  GoodiesBadge,
  CertificateBadge,
  FoodBadge,
  FreeEntryPill,
} from "./VerificationBadges";
import { formatEventDate, formatEventTime, formatRelativeTime } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Bookmark,
  ShieldCheck,
  Building2,
  Train,
  ArrowRight,
} from "lucide-react";

interface EventCardProps {
  event: OrbitEvent;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  variant?: "standard" | "compact" | "featured";
}

export default function EventCard({
  event,
  isSaved = false,
  onToggleSave,
  variant = "standard",
}: EventCardProps) {
  const isRegistrationClosed = event.registration_status === "closed" || event.registration_status === "full";

  return (
    <article className="group relative bg-orbit-card hover:bg-orbit-cardHover border border-orbit-border hover:border-orbit-signal/50 rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col justify-between shadow-card hover:shadow-glow">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-orbit-surface text-orbit-highlight border border-orbit-borderLight">
              {event.category}
            </span>
            <FreeEntryPill />
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSave(event.id);
                }}
                className={`p-2 rounded-xl transition-all border ${
                  isSaved
                    ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/40"
                    : "text-orbit-muted hover:text-orbit-text bg-orbit-surface/80 border-orbit-border hover:border-orbit-borderLight"
                }`}
                title={isSaved ? "Remove from My Events" : "Save to My Events"}
                aria-label={isSaved ? "Remove from My Events" : "Save to My Events"}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-orbit-signal" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <Link href={`/events/${event.slug}`} className="block group-hover:text-orbit-signal transition-colors">
          <h3 className="text-lg md:text-xl font-display font-bold text-orbit-text tracking-tight line-clamp-2">
            {event.name}
          </h3>
        </Link>

        {/* Organizer */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-orbit-muted font-medium">
          <Building2 className="w-3.5 h-3.5 text-orbit-subtle" />
          <span>Organised by <strong className="text-orbit-text font-semibold">{event.organizer}</strong></span>
        </div>

        {/* Date and Time in IST */}
        <div className="mt-3.5 space-y-1.5 bg-orbit-surface/60 rounded-xl p-3 border border-orbit-border/60">
          <div className="flex items-center gap-2 text-xs text-orbit-text font-mono font-medium">
            <Calendar className="w-3.5 h-3.5 text-orbit-signal" />
            <span>{formatEventDate(event.start_at)}</span>
            <span className="text-orbit-subtle">•</span>
            <span className="text-orbit-highlight">{formatEventTime(event.start_at, event.end_at)}</span>
          </div>

          <div className="flex items-start gap-2 text-xs text-orbit-muted">
            <MapPin className="w-3.5 h-3.5 text-orbit-signal shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-orbit-text">{event.venue}</span>
              <span className="text-orbit-subtle">, {event.area}</span>
              {event.metro_station && (
                <div className="text-[11px] text-orbit-subtle flex items-center gap-1 mt-0.5">
                  <Train className="w-3 h-3 text-orbit-secondary" />
                  <span>{event.metro_station}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description snippet */}
        <p className="mt-3 text-xs text-orbit-muted line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Perks & Benefits Verification Matrix */}
        <div className="mt-4 pt-3.5 border-t border-orbit-border/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-orbit-subtle mb-2 flex items-center justify-between">
            <span>Verified Attendee Perks</span>
            <span className="text-[10px] text-emerald-400/90 font-sans flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Independently Vetted
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <GoodiesBadge status={event.goodies_status} />
            <CertificateBadge status={event.certificate_status} />
            <FoodBadge status={event.food_status} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-orbit-border/80 flex flex-col gap-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-orbit-muted">
          <RegistrationBadge status={event.registration_status} />
          <span className="text-[10px] text-orbit-subtle">
            {formatRelativeTime(event.last_verified_at)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/events/${event.slug}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium text-orbit-text bg-orbit-surface hover:bg-orbit-border border border-orbit-border hover:border-orbit-borderLight transition-all"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
              isRegistrationClosed
                ? "bg-orbit-surface/80 text-orbit-muted border border-orbit-border cursor-not-allowed"
                : "bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg shadow-sm hover:shadow-glow"
            }`}
          >
            <span>{isRegistrationClosed ? "Closed" : "Register Free"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
