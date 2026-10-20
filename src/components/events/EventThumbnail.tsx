"use client";

import React, { useState } from "react";
import { OrbitEvent } from "@/types/event";
import { getEventThumbnail, getCategoryFallback } from "@/lib/thumbnails";

interface EventThumbnailProps {
  event: OrbitEvent;
  priority?: boolean;
  className?: string;
  showBadges?: boolean;
}

export default function EventThumbnail({
  event,
  className = "",
}: EventThumbnailProps) {
  const thumbnailData = getEventThumbnail(event);
  const [imgSrc, setImgSrc] = useState(thumbnailData.src);
  const [hasError, setHasError] = useState(false);
  const isStaticFallback = thumbnailData.src.startsWith("/thumbnails/");
  const [isLoading, setIsLoading] = useState(!isStaticFallback);

  // Fallback to static category artwork on image load error
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = getCategoryFallback(event);
      setImgSrc(fallback);
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative w-full aspect-[16/9] overflow-hidden rounded-t-2xl bg-[#FAF9FF] dark:bg-[#151022] border-b border-purple-100/70 dark:border-[#2D224C] flex items-center justify-center transition-colors ${className}`}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-white to-purple-50 dark:from-[#151022] dark:via-[#1E1830] dark:to-[#151022] animate-pulse" />
      )}

      {/* Main Authentic Event Image — Complete Poster, 16:9 Aspect Ratio, Minimal Empty Space */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={thumbnailData.alt}
        loading="eager"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        className={`w-full h-full object-contain object-center transition-all ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
