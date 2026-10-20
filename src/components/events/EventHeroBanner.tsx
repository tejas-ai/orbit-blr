"use client";

import React, { useState } from "react";
import { OrbitEvent } from "@/types/event";
import { getCategoryFallback } from "@/lib/thumbnails";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Train,
} from "lucide-react";

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
  const fallback = getCategoryFallback(event);
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError && imgSrc !== fallback) {
      setIsError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. CLEAN VISUAL MEDIA FRAME — NEVER OVERLAY TITLE OR METADATA ON ARTWORK */}
      <div className="relative w-full aspect-[21/9] min-h-[220px] sm:min-h-[340px] max-h-[460px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/90 shadow-sm flex items-center justify-center">
        {/* Banner Media with Guaranteed Fallback */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          className="w-full h-full object-cover object-center"
        />

        {/* Minimal Floating Category Pill at Top Left (does not obscure artwork) */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
              isHack
                ? "bg-amber-500/90 text-white"
                : "bg-white/95 text-[#6A38EB]"
            }`}
          >
            {isHack ? (
              <Zap className="w-3.5 h-3.5 text-white" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#6A38EB]" />
            )}
            <span>{displayCategory}</span>
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-600/95 text-white shadow-sm backdrop-blur-md">
            ₹0 Free Entry
          </span>
        </div>

        {/* Floating Registration Status Pill at Top Right */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${
              event.registration_status === "open"
                ? "bg-emerald-600/95 text-white"
                : event.registration_status === "approval_required"
                ? "bg-amber-600/95 text-white"
                : "bg-slate-900/90 text-white"
            }`}
          >
            {event.registration_status === "open"
              ? "RSVP Open"
              : event.registration_status === "approval_required"
              ? "Approval Required"
              : "Waitlist"}
          </span>
        </div>
      </div>

      {/* 2. DEDICATED EVENT METADATA HEADER — DISPLAYED CLEANLY BELOW THE VISUAL */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-4">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-serif leading-tight">
          {event.name}
        </h1>

        {/* Key Event Facts Row */}
        <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 text-xs sm:text-sm text-slate-600 font-medium pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <Building2 className="w-4 h-4 text-[#6A38EB]" />
            <span>
              Organised by <strong className="text-slate-950 font-bold">{event.organizer}</strong>
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Calendar className="w-4 h-4 text-[#6A38EB]" />
            <span>{formatEventDate(event.start_at)}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock className="w-4 h-4 text-[#6A38EB]" />
            <span>{formatEventTime(event.start_at, event.end_at)}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-700">
            <MapPin className="w-4 h-4 text-[#6A38EB]" />
            <span>{event.area}, Bengaluru</span>
          </div>

          {event.metro_station && (
            <>
              <span className="text-slate-300 hidden md:inline">•</span>
              <div className="flex items-center gap-1 text-slate-600">
                <Train className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs">Near {event.metro_station} Metro</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
