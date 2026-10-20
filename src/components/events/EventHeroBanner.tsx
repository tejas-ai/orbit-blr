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
      {/* 1. CLEAN VISUAL MEDIA FRAME — ADAPTIVE CONTAINER, ZERO OVERLAYS, MINIMAL WASTED SPACE */}
      <div className="w-full rounded-3xl overflow-hidden bg-[#FAF9FF] dark:bg-[#151022] border border-purple-100/80 dark:border-[#2D224C] shadow-sm flex items-center justify-center p-1.5 sm:p-2.5 transition-colors">
        <div className="w-full flex items-center justify-center">
          {/* Banner Media: Full Width & Auto Height up to a balanced max-height, completely uncropped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={alt}
            onError={handleError}
            className="w-auto h-auto max-w-full max-h-[500px] object-contain rounded-2xl shadow-sm transition-all block mx-auto"
          />
        </div>
      </div>

      {/* 2. DEDICATED EVENT METADATA HEADER — DISPLAYED CLEANLY BELOW THE VISUAL */}
      <div className="bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-5 sm:p-7 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4 transition-colors">
        {/* Top Badges Row (Moved outside and below the image) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Pill */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
              isHack
                ? "bg-amber-100 dark:bg-[#2A1D0D] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60"
                : "bg-purple-100 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/80 dark:border-[#382C58]"
            }`}
          >
            {isHack ? (
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#6A38EB] dark:bg-[#8B5CF6]" />
            )}
            <span>{displayCategory}</span>
          </span>

          {/* ₹0 Free Entry Pill */}
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm">
            ₹0 Free Entry
          </span>

          {/* Registration Status Pill */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
              event.registration_status === "open"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                : event.registration_status === "approval_required"
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60"
                : "bg-slate-100 dark:bg-[#1E1830] text-slate-700 dark:text-[#CBD5E1] border border-slate-200/80 dark:border-[#302B43]"
            }`}
          >
            {event.registration_status === "open"
              ? "RSVP Open"
              : event.registration_status === "approval_required"
              ? "Approval Required"
              : "Waitlist"}
          </span>

          {/* Organiser Verified Pill */}
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#1E1830] text-slate-700 dark:text-[#CBD5E1] border border-slate-200/80 dark:border-[#302B43] flex items-center gap-1.5 ml-auto sm:ml-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Independently Verified</span>
          </span>
        </div>
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif leading-tight">
          {event.name}
        </h1>

        {/* Key Event Facts Row */}
        <div className="flex flex-wrap items-center gap-y-2.5 gap-x-4 text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] font-medium pt-1 border-t border-slate-100 dark:border-[#302B43]">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-[#F7F5FF]">
            <Building2 className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
            <span>
              Organised by <strong className="text-slate-950 dark:text-[#F7F5FF] font-bold">{event.organizer}</strong>
            </span>
          </div>

          <span className="text-slate-300 dark:text-[#302B43] hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-800 dark:text-[#F7F5FF] font-semibold">
            <Calendar className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
            <span>{formatEventDate(event.start_at)}</span>
          </div>

          <span className="text-slate-300 dark:text-[#302B43] hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#CBD5E1]">
            <Clock className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
            <span>{formatEventTime(event.start_at, event.end_at)}</span>
          </div>

          <span className="text-slate-300 dark:text-[#302B43] hidden sm:inline">•</span>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-[#CBD5E1]">
            <MapPin className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
            <span>{event.area}, Bengaluru</span>
          </div>

          {event.metro_station && (
            <>
              <span className="text-slate-300 dark:text-[#302B43] hidden md:inline">•</span>
              <div className="flex items-center gap-1 text-slate-600 dark:text-[#CBD5E1]">
                <Train className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs">Near {event.metro_station} Metro</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
