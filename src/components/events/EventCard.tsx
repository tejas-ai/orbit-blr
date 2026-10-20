"use client";

import React from "react";
import Link from "next/link";
import { OrbitEvent } from "@/types/event";
import EventThumbnail from "./EventThumbnail";
import {
  RegistrationBadge,
  GoodiesBadge,
  CertificateBadge,
  FoodBadge,
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
  Clock,
} from "lucide-react";

interface EventCardProps {
  event: OrbitEvent;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  priority?: boolean;
  variant?: "standard" | "compact" | "featured";
}

export default function EventCard({
  event,
  isSaved = false,
  onToggleSave,
  priority = false,
  variant = "standard",
}: EventCardProps) {
  const isClosed = event.registration_status === "closed" || event.registration_status === "full";
  const isWaitlist = event.registration_status === "waitlist";
  const isApprovalRequired = event.registration_status === "approval_required";

  const getRegisterLabel = () => {
    if (isClosed) return "Closed";
    if (isWaitlist) return "Join Waitlist";
    if (isApprovalRequired) return "Request RSVP";
    return "Register Free";
  };

  return (
    <article className="group relative bg-orbit-card hover:bg-orbit-cardHover border border-orbit-border hover:border-orbit-signal/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-card hover:shadow-glow">
      {/* 1. MANDATORY AUTHENTIC THUMBNAIL (Front of Card) */}
      <div className="relative">
        <Link href={`/events/${event.slug}`} tabIndex={-1} aria-hidden="true">
          <EventThumbnail event={event} priority={priority} />
        </Link>

        {/* Floating Bookmark Button over Thumbnail */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(event.id);
            }}
            className={`absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all border ${
              isSaved
                ? "bg-orbit-signal/25 text-orbit-signal border-orbit-signal/60 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                : "text-white/80 hover:text-white bg-black/60 border-white/20 hover:border-white/40"
            }`}
            title={isSaved ? "Remove from My Events" : "Save to My Events"}
            aria-label={isSaved ? "Remove from My Events" : "Save to My Events"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-orbit-signal" : ""}`} />
          </button>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block group-hover:text-orbit-signal transition-colors">
            <h3 className="text-lg md:text-xl font-display font-bold text-orbit-text tracking-tight line-clamp-2 leading-snug">
              {event.name}
            </h3>
          </Link>

          {/* Organizer */}
          <div className="flex items-center gap-1.5 text-xs text-orbit-muted font-medium">
            <Building2 className="w-3.5 h-3.5 text-orbit-signal shrink-0" />
            <span className="truncate">
              Organised by <strong className="text-orbit-text font-semibold">{event.organizer}</strong>
            </span>
          </div>

          {/* Date & Time in IST */}
          <div className="space-y-2 bg-orbit-surface/70 rounded-xl p-3 border border-orbit-border/80">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-orbit-text font-bold">
                <Calendar className="w-3.5 h-3.5 text-orbit-pink shrink-0" />
                <span>{formatEventDate(event.start_at)}</span>
              </div>
              <span className="text-[11px] font-semibold text-orbit-highlight px-2 py-0.5 rounded-md bg-orbit-card border border-orbit-border/80">
                {formatEventTime(event.start_at, event.end_at)}
              </span>
            </div>

            {/* Venue & Bengaluru Tech Corridor */}
            <div className="flex items-start gap-2 text-xs text-orbit-muted pt-1.5 border-t border-orbit-border/50">
              <MapPin className="w-3.5 h-3.5 text-orbit-sunset shrink-0 mt-0.5" />
              <div className="leading-snug truncate">
                <span className="font-semibold text-orbit-text">{event.venue}</span>
                <span className="text-orbit-subtle"> • {event.area}</span>
                {event.metro_station && (
                  <div className="text-[10px] text-orbit-secondary flex items-center gap-1 mt-0.5 font-mono">
                    <Train className="w-3 h-3 text-orbit-signal" />
                    <span>{event.metro_station}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-orbit-muted line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Perks & Benefits Verification Matrix */}
          <div className="pt-3 border-t border-orbit-border/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-orbit-subtle mb-2 flex items-center justify-between">
              <span>Verified Attendee Perks</span>
              <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Vetted
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <GoodiesBadge status={event.goodies_status} />
              <CertificateBadge status={event.certificate_status} />
              <FoodBadge status={event.food_status} />
            </div>
          </div>
        </div>

        {/* 3. Footer Actions & Verification Status */}
        <div className="pt-3.5 border-t border-orbit-border/80 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-orbit-muted">
            <RegistrationBadge status={event.registration_status} />
            <span className="text-[10px] text-orbit-subtle">
              {formatRelativeTime(event.last_verified_at)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/events/${event.slug}`}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium text-orbit-text bg-orbit-surface hover:bg-orbit-surfaceHover border border-orbit-border hover:border-orbit-borderLight transition-all"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isClosed ? (
              <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-surface/80 text-orbit-subtle border border-orbit-border cursor-not-allowed">
                <span>Closed</span>
              </span>
            ) : (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-orbit-signal to-orbit-signalHover hover:from-orbit-signalHover hover:to-orbit-signal text-orbit-bg shadow-sm hover:shadow-glow transition-all"
              >
                <span>{getRegisterLabel()}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
