"use client";

import React, { useState } from "react";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail } from "@/lib/thumbnails";
import { ShieldCheck, Sparkles, CheckCircle2, Clock, AlertTriangle, Lock } from "lucide-react";

interface EventThumbnailProps {
  event: OrbitEvent;
  priority?: boolean;
  className?: string;
  showBadges?: boolean;
}

export default function EventThumbnail({
  event,
  priority = false,
  className = "",
  showBadges = true,
}: EventThumbnailProps) {
  const thumbnailData = getEventThumbnail(event);
  const [imgSrc, setImgSrc] = useState(thumbnailData.src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback to category artwork on image load error
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fall back to category SVG
      const fallback = getEventThumbnail({ ...event, thumbnail_url: null });
      setImgSrc(fallback.src);
      setIsLoading(false);
    }
  };

  const isVerifiedAsset = thumbnailData.isVerified && !hasError;

  return (
    <div
      className={`relative w-full aspect-[16/9] overflow-hidden rounded-t-2xl bg-orbit-surface/80 border-b border-orbit-border/80 ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-orbit-surface via-orbit-borderLight/30 to-orbit-surface animate-pulse" />
      )}

      {/* Main Authentic Event Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={thumbnailData.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        className={`w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Cinematic Vignette & Bottom Legibility Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-orbit-card via-orbit-card/30 to-black/30 pointer-events-none" />

      {/* Optional Top Badges */}
      {showBadges && (
        <>
          {/* Top-Left: Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase bg-orbit-bg/85 backdrop-blur-md text-orbit-highlight border border-orbit-signal/30 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-signal animate-pulse" />
              <span>{event.category}</span>
            </span>
          </div>

          {/* Top-Right: ₹0 FREE Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-extrabold tracking-wider bg-emerald-500/20 backdrop-blur-md text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              <span>₹0 FREE</span>
            </span>
          </div>

          {/* Bottom-Left: Registration Status Indicator */}
          <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5">
            {event.registration_status === "open" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-800/80">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>RSVP OPEN</span>
              </span>
            )}
            {event.registration_status === "approval_required" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 backdrop-blur-md text-amber-300 border border-amber-800/80">
                <Lock className="w-3 h-3 text-amber-300" />
                <span>APPROVAL REQ</span>
              </span>
            )}
            {event.registration_status === "waitlist" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950/80 backdrop-blur-md text-purple-300 border border-purple-800/80">
                <Clock className="w-3 h-3 text-purple-300" />
                <span>WAITLIST</span>
              </span>
            )}
            {event.registration_status === "closed" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/80 backdrop-blur-md text-rose-300 border border-rose-800/80">
                <AlertTriangle className="w-3 h-3 text-rose-300" />
                <span>CLOSED</span>
              </span>
            )}
          </div>

          {/* Bottom-Right: Verified Asset Watermark / Source Tag */}
          <div className="absolute bottom-2.5 right-3 z-10">
            {isVerifiedAsset ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono bg-orbit-bg/90 backdrop-blur-md text-orbit-signal border border-orbit-signal/30 shadow-glow"
                title={thumbnailData.attribution}
              >
                <ShieldCheck className="w-3 h-3 text-orbit-signal" />
                <span>Official Poster</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono bg-orbit-bg/85 backdrop-blur-md text-orbit-muted border border-orbit-border/60"
                title="ORBIT BLR Verified Series Artwork"
              >
                <Sparkles className="w-3 h-3 text-orbit-secondary" />
                <span>Verified Series</span>
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
