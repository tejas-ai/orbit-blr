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
import { extractHackathonDetails } from "@/lib/hackathons";
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
  Zap,
  Users,
  Timer,
  GraduationCap,
  AlertCircle,
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
  const hackathon = extractHackathonDetails(event);
  const isClosed =
    event.registration_status === "closed" ||
    event.registration_status === "full" ||
    Boolean(hackathon.isDeadlinePassed);
  const isWaitlist = event.registration_status === "waitlist" && !isClosed;
  const isApprovalRequired = event.registration_status === "approval_required" && !isClosed;

  const getRegisterLabel = () => {
    if (isClosed) return "Closed";
    if (isWaitlist) return "Join Waitlist";
    if (isApprovalRequired) return "Apply to Attend";
    return "Register Free";
  };

  return (
    <article
      data-testid="event-card"
      className="group relative bg-[#130D26] hover:bg-[#1A1233] border border-purple-500/20 hover:border-purple-400/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-card hover:shadow-glow"
    >
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
            className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-xl backdrop-blur-md transition-all border ${
              isSaved
                ? "bg-purple-600/40 text-purple-200 border-purple-400/60 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                : "text-white/80 hover:text-white bg-black/60 border-white/20 hover:border-white/40"
            }`}
            title={isSaved ? "Remove from My Events" : "Save to My Events"}
            aria-label={isSaved ? "Remove from My Events" : "Save to My Events"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-purple-300 text-purple-300" : ""}`} />
          </button>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Title */}
          <Link href={`/events/${event.slug}`} className="block group-hover:text-purple-300 transition-colors">
            <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight line-clamp-2 leading-snug">
              {event.name}
            </h3>
          </Link>

          {/* Organizer */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">
              Organised by <strong className="text-white font-semibold">{event.organizer}</strong>
            </span>
          </div>

          {/* Date & Time in IST */}
          <div className="space-y-2 bg-white/[0.03] rounded-xl p-3 border border-purple-500/15">
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{formatEventDate(event.start_at)}</span>
              </div>
              <span className="text-[11px] font-semibold text-purple-200 px-2 py-0.5 rounded-md bg-[#18112E] border border-purple-500/25">
                {formatEventTime(event.start_at, event.end_at)}
              </span>
            </div>

            {/* Venue & Bengaluru Tech Corridor */}
            <div className="flex items-start gap-2 text-xs text-slate-300 pt-1.5 border-t border-purple-500/10">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-snug truncate">
                <span className="font-semibold text-white">{event.venue}</span>
                <span className="text-slate-400"> • {event.area}</span>
                {event.metro_station && (
                  <div className="text-[10px] text-purple-300 flex items-center gap-1 mt-0.5 font-mono">
                    <Train className="w-3 h-3 text-purple-400" />
                    <span>{event.metro_station}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Excerpt */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Dedicated Hackathon Specifications */}
          {hackathon.isHackathon && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified In-Person Hackathon {hackathon.duration ? `• ${hackathon.duration}` : ""}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-amber-200/90 text-[10px]">
                {hackathon.teamSize && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-400" />
                    <span>{hackathon.teamSize}</span>
                  </span>
                )}
                {hackathon.registrationDeadline && (
                  <span className={`flex items-center gap-1 ${hackathon.isDeadlinePassed ? "text-red-300 line-through" : ""}`}>
                    <Timer className={`w-3 h-3 ${hackathon.isDeadlinePassed ? "text-red-400" : "text-amber-400"}`} />
                    <span>{hackathon.isDeadlinePassed ? "Closed: " : "Deadline: "}{hackathon.registrationDeadline}</span>
                  </span>
                )}
                {hackathon.eligibility && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-amber-400" />
                    <span>{hackathon.eligibility}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Perks & Benefits Verification Matrix */}
          <div className="pt-3 border-t border-purple-500/15">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
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
        <div className="pt-3.5 border-t border-purple-500/20 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <RegistrationBadge status={event.registration_status} />
            <span className="text-[10px] text-slate-400">
              {formatRelativeTime(event.last_verified_at)}
            </span>
          </div>

          {/* Admission guarantee disclaimer if approval required */}
          {isApprovalRequired && (
            <div className="text-[10px] text-amber-300/90 font-mono flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <AlertCircle className="w-3 h-3 shrink-0 text-amber-400" />
              <span>Host selection required • RSVP does not guarantee entry</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/events/${event.slug}`}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium text-white bg-white/[0.04] hover:bg-white/[0.08] border border-purple-500/20 hover:border-purple-400/40 transition-all"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {isClosed ? (
              <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold bg-white/[0.02] text-slate-500 border border-white/5 cursor-not-allowed">
                <span>Closed</span>
              </span>
            ) : (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm hover:shadow-md transition-all"
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
