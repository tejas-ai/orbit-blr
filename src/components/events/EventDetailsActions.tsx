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
  Lock,
} from "lucide-react";

interface EventDetailsActionsProps {
  event: OrbitEvent;
}

export default function EventDetailsActions({ event }: EventDetailsActionsProps) {
  const { isSaved, toggleSave } = useSavedEvents();
  const [copied, setCopied] = useState(false);

  const saved = isSaved(event.id);
  const isClosed = event.registration_status === "closed" || event.registration_status === "full";
  const isWaitlist = event.registration_status === "waitlist";
  const isApprovalRequired = event.registration_status === "approval_required";

  const getRegisterCtaText = () => {
    if (isClosed) return "REGISTRATION CLOSED";
    if (isWaitlist) return "JOIN OFFICIAL WAITLIST";
    if (isApprovalRequired) return "REQUEST OFFICIAL INVITATION";
    return "REGISTER ON OFFICIAL SITE";
  };

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
          text: `Verified 100% free tech event in Bengaluru: ${event.name}`,
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
      {/* Primary Sticky Register Action */}
      {isClosed ? (
        <button
          type="button"
          disabled
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-mono font-extrabold uppercase tracking-wider bg-orbit-surface/80 text-orbit-subtle border border-orbit-border cursor-not-allowed"
        >
          <span>{getRegisterCtaText()}</span>
        </button>
      ) : (
        <a
          href={event.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm sm:text-base font-mono font-extrabold uppercase tracking-wider transition-all bg-gradient-to-r from-orbit-signal via-orbit-signalHover to-orbit-signal text-orbit-bg shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] transform active:scale-95"
        >
          <span>{getRegisterCtaText()}</span>
          <ExternalLink className="w-5 h-5 ml-0.5" />
        </a>
      )}

      {isApprovalRequired && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Physical Campus Clearance:</strong> Host requires approval & RSVP confirmation email prior to entry.
          </span>
        </div>
      )}

      {/* Calendar Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={getGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
        >
          <Calendar className="w-3.5 h-3.5 text-orbit-pink" />
          <span>Google Calendar</span>
        </a>

        <button
          type="button"
          onClick={handleDownloadIcs}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
        >
          <Download className="w-3.5 h-3.5 text-orbit-signal" />
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
              ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/50 shadow-glow"
              : "bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-muted hover:text-orbit-text border-orbit-border"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-orbit-signal" : ""}`} />
          <span>{saved ? "Saved in My Events" : "Save Event"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-muted hover:text-orbit-text border border-orbit-border transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-orbit-sunset" />
              <span>Share Event</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
