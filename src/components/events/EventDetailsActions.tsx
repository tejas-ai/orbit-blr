"use client";

import React, { useState } from "react";
import { OrbitEvent } from "@/types/event";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { getGoogleCalendarUrl, generateIcsContent } from "@/lib/utils";
import {
  ExternalLink,
  Calendar,
  Download,
  Bookmark,
  Share2,
  Check,
  ShieldAlert,
} from "lucide-react";

interface EventDetailsActionsProps {
  event: OrbitEvent;
}

export default function EventDetailsActions({ event }: EventDetailsActionsProps) {
  const { isSaved, toggleSave } = useSavedEvents();
  const [copied, setCopied] = useState(false);

  const saved = isSaved(event.id);
  const isClosed = event.registration_status === "closed" || event.registration_status === "full";

  const handleDownloadIcs = () => {
    const icsData = generateIcsContent(event);
    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.slug}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Check out this free tech event in Bengaluru: ${event.name}`,
          url,
        });
        return;
      } catch {
        // user cancelled or failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Register Free Action */}
      <a
        href={event.registration_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-base font-mono font-bold transition-all shadow-glow ${
          isClosed
            ? "bg-orbit-surface text-orbit-muted border border-orbit-border cursor-not-allowed shadow-none"
            : "bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg"
        }`}
      >
        <span>{isClosed ? "Registration Closed" : "Register Free (Official Link)"}</span>
        <ExternalLink className="w-5 h-5" />
      </a>

      {event.approval_required && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-orbit-highlight/10 border border-orbit-highlight/25 text-xs text-orbit-highlight">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Host requires approval / company RSVP confirmation prior to campus entry.
          </span>
        </div>
      )}

      {/* Calendar Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={getGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-card text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-orbit-signal" />
          <span>Google Calendar</span>
        </a>

        <button
          type="button"
          onClick={handleDownloadIcs}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-card text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
        >
          <Download className="w-3.5 h-3.5 text-orbit-highlight" />
          <span>Download .ICS</span>
        </button>
      </div>

      {/* Utility Actions: Save & Share */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orbit-border/80">
        <button
          type="button"
          onClick={() => toggleSave(event.id)}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all border ${
            saved
              ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/40"
              : "bg-orbit-surface hover:bg-orbit-card text-orbit-muted hover:text-orbit-text border-orbit-border"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-orbit-signal" : ""}`} />
          <span>{saved ? "Saved in My Events" : "Save Event"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-card text-orbit-muted hover:text-orbit-text border border-orbit-border transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Event</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
