"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EventCountdown from "@/components/events/EventCountdown";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail, getCategoryFallback } from "@/lib/thumbnails";
import { extractHackathonDetails, isHackathonEvent } from "@/lib/hackathons";
import {
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  ShieldCheck,
  ChevronRight,
  Gift,
  Award,
  Coffee,
  Users,
  Timer,
} from "lucide-react";

interface EventCardProps {
  event: OrbitEvent;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  priority?: boolean;
  variant?: "standard" | "compact" | "featured";
}

function formatDate(iso?: string | null) {
  if (!iso) return { month: "TBA", day: "--", full: "Date TBA", time: "" };
  try {
    const d = new Date(iso);
    const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "Asia/Kolkata" }).toUpperCase();
    const day = d.toLocaleDateString("en-US", { day: "numeric", timeZone: "Asia/Kolkata" });
    const full = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
    return { month, day, full, time };
  } catch {
    return { month: "TBA", day: "--", full: "Date TBA", time: "" };
  }
}

/**
 * Defensive poster image component:
 * Guarantees zero broken images by automatically replacing failed URLs with category SVG artwork.
 * Displays the complete uncropped image with intrinsic aspect ratio.
 */
function DefensivePosterImage({
  event,
  priority = false,
  className = "object-contain",
}: {
  event: OrbitEvent;
  priority?: boolean;
  className?: string;
}) {
  const thumb = getEventThumbnail(event);
  const fallback = getCategoryFallback(event);
  const [src, setSrc] = useState(thumb.src);

  return (
    <Image
      src={src}
      alt={thumb.alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
      className={className}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => {
        if (src !== fallback) {
          setSrc(fallback);
        }
      }}
      unoptimized
    />
  );
}

export default function EventCard({
  event,
  isSaved = false,
  onToggleSave,
  priority = false,
}: EventCardProps) {
  const router = useRouter();
  const prefetchDetails = () => router.prefetch(`/events/${event.slug}`);
  const dateInfo = formatDate(event.start_at);
  const isHack = isHackathonEvent(event);
  const hackathon = extractHackathonDetails(event);
  const isClosed =
    event.registration_status === "closed" ||
    event.registration_status === "full" ||
    Boolean(hackathon.isDeadlinePassed);

  return (
    <article
      data-testid="event-card"
      className="group bg-white dark:bg-[#1D1B2C] rounded-3xl border border-purple-100/80 dark:border-[#302B43] shadow-sm hover:shadow-xl dark:hover:shadow-[0_12px_32px_-6px_rgba(139,92,246,0.22)] dark:hover:border-[#8B5CF6]/50 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-[#8B5CF6]"
    >
      {/* 1. CLEAN POSTER CONTAINER — 16:9 INTRINSIC ASPECT RATIO, ZERO OVERLAYS, MINIMAL WASTED SPACE */}
      <div className="relative aspect-[16/9] w-full bg-[#FAF9FF] dark:bg-[#151022] border-b border-purple-100/70 dark:border-[#2D224C] overflow-hidden flex items-center justify-center transition-colors">
        <Link href={`/events/${event.slug}`} prefetch={false} onMouseEnter={prefetchDetails} onFocus={prefetchDetails} className="relative w-full h-full block">
          <DefensivePosterImage
            event={event}
            priority={priority}
            className="object-contain object-center"
          />
        </Link>
      </div>

      {/* 2. CARD CONTENT BODY — ALL METADATA ORGANIZED OUTSIDE THE IMAGE */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Row: Category + Registration Status + Bookmark Button */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/60 dark:border-[#382C58] text-[10px] font-bold uppercase tracking-wider">
                {isHack ? "Hackathon" : event.category}
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isClosed
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    : event.registration_status === "open"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50"
                    : event.registration_status === "approval_required"
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50"
                    : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50"
                }`}
              >
                {isClosed
                  ? "Closed"
                  : event.registration_status === "open"
                  ? "Open"
                  : event.registration_status === "approval_required"
                  ? "Approval Req"
                  : "Waitlist"}
              </span>

              {isHack && hackathon?.teamSize && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-[#2A1D0D] text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 text-[10px] font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{hackathon.teamSize}</span>
                </span>
              )}
            </div>

            {/* Floating Bookmark Button Moved Cleanly Outside the Image */}
            {onToggleSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleSave(event.id);
                }}
                aria-label={isSaved ? "Remove from saved events" : "Save this event"}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] shrink-0 ${
                  isSaved
                    ? "bg-[#6A38EB] dark:bg-[#8B5CF6] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-[#1E1830] text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] hover:bg-purple-50 dark:hover:bg-[#251D3D] border border-transparent dark:border-[#382C58]"
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-white" : ""}`} />
              </button>
            )}
          </div>

          {/* Prominent Date & Time Row */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#8B5CF6] shrink-0" />
            <span>{dateInfo.full}</span>
            {dateInfo.time && (
              <>
                <span className="text-slate-300 dark:text-[#382C58]">•</span>
                <span className="text-[11px] font-medium text-slate-600 dark:text-[#CBD5E1]">{dateInfo.time}</span>
              </>
            )}
          </div>

          <div className="mb-2"><EventCountdown startAt={event.start_at} endAt={event.end_at} /></div>

          {/* Event Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-950 dark:text-[#F7F5FF] leading-snug line-clamp-2 group-hover:text-[#6A38EB] dark:group-hover:text-[#A78BFA] transition-colors">
            <Link href={`/events/${event.slug}`} prefetch={false} onMouseEnter={prefetchDetails} onFocus={prefetchDetails} className="focus-visible:outline-none focus-visible:underline rounded">
              {event.name}
            </Link>
          </h3>

          {/* Organizer */}
          <p className="text-[11px] font-medium text-slate-600 dark:text-[#CBD5E1] mt-1 line-clamp-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#6A38EB] dark:text-[#A78BFA] shrink-0" />
            <span>{event.organizer}</span>
          </p>

          {/* Location */}
          <div className="mt-2 text-xs text-slate-600 dark:text-[#C4C0D6]">
            <div className="flex items-center gap-1.5 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-purple-400 dark:text-[#A78BFA] shrink-0" />
              <span className="line-clamp-1">
                {event.area}, {event.venue}
              </span>
            </div>
          </div>

          {/* Verified Perks: Displayed ONLY when confirmed by organisers */}
          <div className="mt-3 flex flex-wrap gap-1">
            {(event.food_status === "complimentary_meals_confirmed" ||
              event.food_status === "refreshments_confirmed") && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40 text-[10px] font-medium">
                <Coffee className="w-2.5 h-2.5" />
                <span>Snacks</span>
              </span>
            )}
            {event.goodies_status === "confirmed" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800/40 text-[10px] font-medium">
                <Gift className="w-2.5 h-2.5" />
                <span>Swag</span>
              </span>
            )}
            {event.certificate_status === "confirmed" && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800/40 text-[10px] font-medium">
                <Award className="w-2.5 h-2.5" />
                <span>Certificate</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. CARD FOOTER: PRICING & ACTION */}
        <div className="mt-4 pt-3.5 border-t border-purple-100/70 dark:border-[#302B43] flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-[#F7F5FF]">₹0</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 ml-1 font-bold">Free Entry</span>
          </div>

          <Link
            href={`/events/${event.slug}`}
            prefetch={false}
            onMouseEnter={prefetchDetails}
            onFocus={prefetchDetails}
            className="px-4 py-1.5 rounded-full bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white text-xs font-bold transition-all shadow-sm shadow-purple-500/20 flex items-center gap-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1D1B2C]"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
