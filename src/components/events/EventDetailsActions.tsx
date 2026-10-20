"use client";

import React, { useState } from "react";
import { OrbitEvent } from "@/types/event";
import { useSavedEvents } from "@/lib/useSavedEvents";
import { getGoogleCalendarUrl, generateIcsContent, formatEventDate, formatEventTime } from "@/lib/utils";
import { extractHackathonDetails } from "@/lib/hackathons";
import {
  ExternalLink,
  Calendar,
  Download,
  Bookmark,
  Share2,
  Check,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  Zap,
} from "lucide-react";

interface EventDetailsActionsProps {
  event: OrbitEvent;
}

export default function EventDetailsActions({ event }: EventDetailsActionsProps) {
  const { isSaved, toggleSave } = useSavedEvents();
  const [copied, setCopied] = useState(false);

  const saved = isSaved(event.id);
  const hackathon = extractHackathonDetails(event);
  const isClosed =
    event.registration_status === "closed" ||
    event.registration_status === "full" ||
    Boolean(hackathon.isDeadlinePassed);
  const isWaitlist = event.registration_status === "waitlist" && !isClosed;
  const isApprovalRequired = event.registration_status === "approval_required" && !isClosed;

  const getRegisterCtaText = () => {
    if (isClosed) return "REGISTRATION CLOSED";
    if (isWaitlist) return "JOIN OFFICIAL WAITLIST";
    if (isApprovalRequired) return "APPLY ON OFFICIAL SITE";
    return "REGISTER ON OFFICIAL SITE";
  };

  const getMobileCtaText = () => {
    if (isClosed) return "Closed";
    if (isWaitlist) return "Join Waitlist";
    if (isApprovalRequired) return "Apply to Attend";
    return "Register Free";
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
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Verified 100% free tech event in Bengaluru: ${event.name}`,
          url,
        });
        return;
      } catch {
        // user cancelled or fallback
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
    <>
      {/* ============================================================== */}
      {/* 1. DISTRICT DESKTOP STICKY BOOKING CARD                        */}
      {/* ============================================================== */}
      <div className="bg-[#130D26] border border-purple-500/20 rounded-3xl p-6 shadow-card space-y-6">
        {/* District-Style Price Display */}
        <div className="flex items-start justify-between pb-4 border-b border-purple-500/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
                ₹0
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                FREE ADMISSION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              100% Free Entry • Verified Tech Community
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleSave(event.id)}
            className={`p-2.5 rounded-2xl border transition-all ${
              saved
                ? "bg-purple-600/40 text-purple-200 border-purple-400/60 shadow-glow"
                : "bg-white/[0.04] text-slate-400 hover:text-white border-purple-500/20 hover:border-purple-400/40"
            }`}
            title={saved ? "Saved in My Events" : "Save Event"}
            aria-label={saved ? "Saved in My Events" : "Save Event"}
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-purple-300 text-purple-300" : ""}`} />
          </button>
        </div>

        {/* Quick Date, Time & Venue Block */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.03] border border-purple-500/15">
          <div className="flex items-start gap-2.5 text-xs text-white font-mono">
            <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{formatEventDate(event.start_at)}</span>
              <span className="text-purple-300 text-[11px]">
                {formatEventTime(event.start_at, event.end_at)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-2 border-t border-purple-500/10">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug truncate">
              <span className="font-semibold text-white block truncate">{event.venue}</span>
              <span className="text-[11px] text-slate-400">Hub: {event.area}, Bengaluru</span>
            </div>
          </div>
        </div>

        {/* Primary District Register Button */}
        <div className="space-y-2">
          {isClosed ? (
            <button
              type="button"
              disabled
              data-testid="sticky-register-cta"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-mono font-extrabold uppercase tracking-wider bg-white/[0.03] text-slate-500 border border-white/5 cursor-not-allowed"
            >
              <span>{getRegisterCtaText()}</span>
            </button>
          ) : (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="sticky-register-cta"
              className="group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-sm sm:text-base font-mono font-extrabold uppercase tracking-wider transition-all bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/40 transform active:scale-95"
            >
              <span>{getRegisterCtaText()}</span>
              <ExternalLink className="w-5 h-5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          <p className="text-[11px] font-mono text-center text-slate-400">
            Direct RSVP on official organiser platform ({event.organizer})
          </p>
        </div>

        {/* Registration Deadline Passed Notice */}
        {hackathon.isDeadlinePassed && hackathon.registrationDeadline && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block text-red-300">Registration Deadline Passed:</strong>
              <span>
                Official applications closed on {hackathon.registrationDeadline}. RSVPs are no longer being accepted by the organiser.
              </span>
            </div>
          </div>
        )}

        {/* Physical Campus Security / Pre-approval Notice */}
        {isApprovalRequired && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block text-amber-300">Host Pre-Clearance & Selection:</strong>
              <span>
                Host reviews RSVPs. An application or RSVP does not guarantee entry unless the organiser confirms your acceptance via email.
              </span>
            </div>
          </div>
        )}

        {/* Calendar Sync Shortcuts */}
        <div className="space-y-2 pt-2 border-t border-orbit-border/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-orbit-subtle block">
            Add to your calendar
          </span>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-orbit-pink" />
              <span>Google Cal</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
            >
              <Download className="w-3.5 h-3.5 text-orbit-signal" />
              <span>Apple / .ICS</span>
            </button>
          </div>
        </div>

        {/* Share and Save Bar */}
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
            <span>{saved ? "Saved" : "Save Event"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-surfaceHover text-orbit-muted hover:text-orbit-text border border-orbit-border transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-orbit-sunset" />
                <span>Share Event</span>
              </>
            )}
          </button>
        </div>

        {/* District-Style Trust & Verification Guarantee */}
        <div className="pt-4 border-t border-orbit-border/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Orbit BLR Verification Guarantee</span>
          </div>
          <ul className="text-[11px] text-orbit-muted space-y-1 font-sans">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>100% Free Entry Guaranteed — No hidden paid tiers</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>Direct official registration link (No phishing or spam)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              <span>Zero commercial bias or paid promotion</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DISTRICT MOBILE STICKY BOTTOM BOOKING BAR                   */}
      {/* ============================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#120D24]/95 backdrop-blur-xl border-t border-purple-500/20 px-4 py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Price & Date Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-display font-extrabold text-white">₹0</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                FREE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {formatEventDate(event.start_at)} • {event.area}
            </p>
          </div>

          {/* Quick Actions & Mobile Register Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSave(event.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                saved
                  ? "bg-purple-600/40 text-purple-200 border-purple-400/60"
                  : "bg-white/[0.04] text-slate-400 border-purple-500/20"
              }`}
              title={saved ? "Saved" : "Save"}
              aria-label={saved ? "Saved" : "Save"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-purple-300 text-purple-300" : ""}`} />
            </button>

            {isClosed ? (
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-white/[0.03] text-slate-500 border border-white/5 cursor-not-allowed"
              >
                Closed
              </button>
            ) : (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-95 transition-all"
              >
                <span>{getMobileCtaText()}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
