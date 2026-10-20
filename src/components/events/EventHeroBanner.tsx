"use client";

import React, { useState } from "react";
import { OrbitEvent } from "@/types/event";
import { getCategoryFallback } from "@/lib/thumbnails";
import { formatEventDate, formatEventTime, formatRelativeTime } from "@/lib/utils";
import {
  RegistrationBadge,
  FreeEntryPill,
} from "@/components/events/VerificationBadges";
import { Building2, Calendar, Clock, ShieldCheck, Zap } from "lucide-react";

interface EventHeroBannerProps {
  event: OrbitEvent;
  initialSrc: string;
  alt: string;
  displayCategory: string;
  isHack: boolean;
}

export default function EventHeroBanner({
  event,
  initialSrc,
  alt,
  displayCategory,
  isHack,
}: EventHeroBannerProps) {
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setImgSrc(getCategoryFallback(event));
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-[#120D24] shadow-card">
      <div className="relative w-full aspect-[21/9] min-h-[300px] sm:min-h-[400px] max-h-[520px] overflow-hidden bg-[#0F0A1C]">
        {/* Banner Media with Guaranteed Fallback */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          className="w-full h-full object-cover object-center"
        />

        {/* Ambient Overlay Vignette for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0813] via-[#0B0813]/65 to-black/30 pointer-events-none" />

        {/* Top Overlay Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <span
              className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
                isHack
                  ? "bg-amber-950/90 text-amber-300 border border-amber-500/40"
                  : "bg-purple-950/90 text-purple-200 border border-purple-500/30"
              }`}
            >
              {isHack ? (
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-purple-400" />
              )}
              <span>{displayCategory}</span>
            </span>
            <FreeEntryPill />
          </div>
          <div className="pointer-events-auto">
            <RegistrationBadge status={event.registration_status} />
          </div>
        </div>

        {/* Bottom Overlay Info Banner */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 space-y-3 pointer-events-none">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white tracking-tight leading-tight max-w-4xl drop-shadow-md break-words">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-300 pointer-events-auto">
            <div className="flex items-center gap-1.5 font-medium text-white">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>
                Organised by <strong className="text-purple-300">{event.organizer}</strong>
              </span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-mono text-white">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{formatEventDate(event.start_at)}</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-mono text-purple-200">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>{formatEventTime(event.start_at, event.end_at)}</span>
            </div>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified: {formatRelativeTime(event.last_verified_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
