"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OrbitEvent } from "@/types/event";
import { isHackathonEvent } from "@/lib/hackathons";
import { useSavedEvents } from "@/lib/useSavedEvents";
import EventCard from "@/components/events/EventCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Bookmark, Calendar, ArrowRight, Download, Trash2, Compass } from "lucide-react";
import { generateIcsContent } from "@/lib/utils";

export default function SavedEventsPage() {
  const { savedIds, isSaved, toggleSave, isLoaded } = useSavedEvents();
  const [events, setEvents] = useState<OrbitEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSavedEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedEvents();
  }, []);

  const savedEventsList = events.filter((e) => savedIds.includes(e.id));

  const savedRegularEvents = savedEventsList.filter((e) => !isHackathonEvent(e));
  const savedHackathons = savedEventsList.filter(isHackathonEvent);

  // Export all saved events into a unified ICS
  const handleExportAllIcs = () => {
    if (savedEventsList.length === 0) return;

    const eventBlocks = savedEventsList
      .map((e) => {
        const content = generateIcsContent(e);
        const lines = content.split("\r\n");
        return lines.slice(5, -1).join("\r\n"); // Include BEGIN:VEVENT and END:VEVENT
      })
      .join("\r\n");

    const fullIcs = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Orbit BLR//Saved Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      eventBlocks,
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([fullIcs], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "orbit-blr-my-events.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleClearAll = () => {
    if (confirm("Remove all saved events from your browser?")) {
      savedIds.forEach((id) => toggleSave(id));
    }
  };

  return (
    <div className="orbit-wallpaper-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 sm:pb-6 space-y-5 sm:space-y-6 bg-white dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] transition-colors duration-300">
      {/* Header */}
      <ScrollReveal direction="down" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-[#302B43] pb-4 pt-1">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
            My Saved Tech Events & Hackathons
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-1">
            Stored locally in your browser. Track upcoming dates, register directly, and sync to your calendar.
          </p>
        </div>

        {savedEventsList.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportAllIcs}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All to .ICS</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 rounded-full text-slate-500 dark:text-[#CBD5E1] hover:text-rose-600 bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] transition-colors"
              title="Clear all saved events"
              aria-label="Clear all saved events"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </ScrollReveal>

      {/* Content */}
      {loading || !isLoaded ? (
        <div className="p-12 text-center text-slate-500 dark:text-[#CBD5E1] text-sm">
          Loading saved events...
        </div>
      ) : savedEventsList.length > 0 ? (
        <div className="space-y-6 sm:space-y-7">
          {[
            { title: "Saved Events", href: "/explore", entries: savedRegularEvents },
            { title: "Saved Hackathons", href: "/hackathons", entries: savedHackathons },
          ].filter((group) => group.entries.length > 0).map((group) => (
            <section key={group.href} className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-[#302B43] pb-3">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF]">{group.title} ({group.entries.length})</h2>
                <Link href={group.href} className="text-xs font-semibold text-[#6A38EB] dark:text-[#A78BFA]">Explore {group.title} →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {group.entries.map((event, index) => (
                  <ScrollReveal key={event.id} staggerIndex={index % 4}>
                    <EventCard event={event} isSaved={isSaved(event.id)} onToggleSave={toggleSave} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <ScrollReveal direction="down" className="bg-white dark:bg-[#1D1B2C] border border-slate-200 dark:border-[#302B43] rounded-3xl p-10 sm:p-14 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-[#151522] flex items-center justify-center mx-auto mb-4 border border-purple-100 dark:border-[#302B43]">
            <Bookmark className="w-6 h-6 text-[#6A38EB] dark:text-[#A78BFA]" />
          </div>
          <h2 className="font-extrabold text-xl text-slate-950 dark:text-[#F7F5FF] font-serif">
            No saved events yet
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#CBD5E1] mt-2 leading-relaxed">
            Click the bookmark icon on any event card while exploring to keep track of upcoming meetups, workshops, and registrations.
          </p>
          <div className="mt-6">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#6A38EB] text-white hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] transition-all shadow-sm active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Free Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
