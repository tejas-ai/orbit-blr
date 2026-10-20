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
        // user cancelled
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
      <div className="bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] space-y-5 transition-colors">
        {/* District-Style Price Display */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#302B43]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
                ₹0
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">
                FREE ADMISSION
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-1">
              100% Free Entry • Verified Tech Gathering
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleSave(event.id)}
            className={`p-2.5 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
              saved
                ? "bg-purple-50 dark:bg-[#8B5CF6]/20 text-[#6A38EB] dark:text-[#A78BFA] border-purple-200 dark:border-[#8B5CF6]/50 shadow-sm"
                : "bg-slate-50 dark:bg-[#151522] text-slate-500 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF] border-slate-200 dark:border-[#302B43]"
            }`}
            title={saved ? "Saved in My Events" : "Save Event"}
            aria-label={saved ? "Saved in My Events" : "Save Event"}
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-[#6A38EB] dark:fill-[#A78BFA]" : ""}`} />
          </button>
        </div>

        {/* Quick Date, Time & Venue Block */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#151522] border border-slate-200/70 dark:border-[#302B43]">
          <div className="flex items-start gap-2.5 text-xs text-slate-900 dark:text-[#F7F5FF]">
            <Calendar className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{formatEventDate(event.start_at)}</span>
              <span className="text-slate-600 dark:text-[#CBD5E1] text-[11px]">
                {formatEventTime(event.start_at, event.end_at)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-[#CBD5E1] pt-2 border-t border-slate-200/50 dark:border-[#302B43]/70">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-snug truncate">
              <span className="font-semibold text-slate-900 dark:text-[#F7F5FF] block truncate">{event.venue}</span>
              <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">Hub: {event.area}, Bengaluru</span>
            </div>
          </div>
        </div>

        {/* Primary Register Button */}
        <div className="space-y-2">
          {isClosed ? (
            <button
              type="button"
              disabled
              data-testid="sticky-register-cta"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#151522] text-slate-400 dark:text-[#CBD5E1]/40 border border-slate-200 dark:border-[#302B43] cursor-not-allowed"
            >
              <span>{getRegisterCtaText()}</span>
            </button>
          ) : (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="sticky-register-cta"
              className="group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white shadow-md shadow-purple-500/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1D1B2C]"
            >
              <span>{getRegisterCtaText()}</span>
              <ExternalLink className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          <p className="text-[11px] text-center text-slate-500 dark:text-[#CBD5E1]">
            Direct RSVP on official organiser site ({event.organizer})
          </p>
        </div>

        {/* Registration Deadline Passed Notice */}
        {hackathon.isDeadlinePassed && hackathon.registrationDeadline && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block text-rose-900 dark:text-rose-200">Application Deadline Passed:</strong>
              <span>
                Official applications closed on {hackathon.registrationDeadline}.
              </span>
            </div>
          </div>
        )}

        {/* Physical Campus Security / Pre-approval Notice */}
        {isApprovalRequired && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-[#2A1D0D] border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block text-amber-900 dark:text-amber-200">Host Pre-Clearance Required:</strong>
              <span>
                Host reviews RSVPs. An application does not guarantee physical entry until confirmed by the host.
              </span>
            </div>
          </div>
        )}

        {/* Calendar Sync Shortcuts */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#302B43]">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-[#CBD5E1] font-bold block">
            Add to calendar
          </span>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-[#151522] dark:hover:bg-[#26233A] text-slate-700 dark:text-[#CBD5E1] dark:hover:text-[#F7F5FF] border border-slate-200 dark:border-[#302B43] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              <Calendar className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
              <span>Google Cal</span>
            </a>

            <button
              type="button"
              onClick={handleDownloadIcs}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-[#151522] dark:hover:bg-[#26233A] text-slate-700 dark:text-[#CBD5E1] dark:hover:text-[#F7F5FF] border border-slate-200 dark:border-[#302B43] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              <Download className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
              <span>Apple / .ICS</span>
            </button>
          </div>
        </div>

        {/* Share and Save Bar */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#302B43]">
          <button
            type="button"
            onClick={() => toggleSave(event.id)}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
              saved
                ? "bg-purple-50 dark:bg-[#8B5CF6]/20 text-[#6A38EB] dark:text-[#A78BFA] border-purple-200 dark:border-[#8B5CF6]/50"
                : "bg-slate-50 hover:bg-slate-100 dark:bg-[#151522] dark:hover:bg-[#26233A] text-slate-700 dark:text-[#CBD5E1] dark:hover:text-[#F7F5FF] border-slate-200 dark:border-[#302B43]"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-[#6A38EB] dark:fill-[#A78BFA]" : ""}`} />
            <span>{saved ? "Saved" : "Save"}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-[#151522] dark:hover:bg-[#26233A] text-slate-700 dark:text-[#CBD5E1] dark:hover:text-[#F7F5FF] border border-slate-200 dark:border-[#302B43] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Verification Guarantee */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#302B43] space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>ORBIT BLR Verified Guarantee</span>
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-[#CBD5E1] space-y-1">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>100% Free Entry Guaranteed</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>Direct official registration link</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span>No commercial bias or paywalls</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DISTRICT MOBILE STICKY BOTTOM REGISTRATION BAR              */}
      {/* ============================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0E0E16]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#302B43] px-4 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.5)] transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Price & Date Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-950 dark:text-[#F7F5FF] font-serif">₹0</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">
                FREE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] truncate">
              {formatEventDate(event.start_at)} • {event.area}
            </p>
          </div>

          {/* Quick Actions & Mobile Register Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSave(event.id)}
              className={`p-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                saved
                  ? "bg-purple-50 dark:bg-[#8B5CF6]/20 text-[#6A38EB] dark:text-[#A78BFA] border-purple-200 dark:border-[#8B5CF6]/50"
                  : "bg-slate-50 dark:bg-[#151522] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#302B43]"
              }`}
              title={saved ? "Saved" : "Save"}
              aria-label={saved ? "Saved" : "Save"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-[#6A38EB] dark:fill-[#A78BFA]" : ""}`} />
            </button>

            {isClosed ? (
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#151522] text-slate-400 dark:text-[#CBD5E1]/50 border border-slate-200 dark:border-[#302B43] cursor-not-allowed"
              >
                Closed
              </button>
            ) : (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
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
