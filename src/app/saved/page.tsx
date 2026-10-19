"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OrbitEvent } from "@/types/event";
import { useSavedEvents } from "@/lib/useSavedEvents";
import EventCard from "@/components/events/EventCard";
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

  // Export all saved events into a unified ICS
  const handleExportAllIcs = () => {
    if (savedEventsList.length === 0) return;

    const eventBlocks = savedEventsList
      .map((e) => {
        const content = generateIcsContent(e);
        const lines = content.split("\r\n");
        return lines.slice(6, -2).join("\r\n"); // Extract VEVENT block
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
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orbit-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Personal Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-orbit-text tracking-tight">
            My Saved Tech Events
          </h1>
          <p className="text-xs sm:text-sm text-orbit-muted mt-1">
            Stored locally in your browser. Track upcoming dates, register directly, and sync to your calendar.
          </p>
        </div>

        {savedEventsList.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportAllIcs}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All to .ICS</span>
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="p-2 rounded-xl text-orbit-subtle hover:text-rose-400 bg-orbit-surface border border-orbit-border transition-colors"
              title="Clear all saved events"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading || !isLoaded ? (
        <div className="p-12 text-center text-orbit-muted font-mono text-sm">
          Loading saved events...
        </div>
      ) : savedEventsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedEventsList.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isSaved={isSaved(event.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="bg-orbit-card/60 border border-orbit-border rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-orbit-surface flex items-center justify-center mx-auto mb-4 border border-orbit-border">
            <Bookmark className="w-6 h-6 text-orbit-signal" />
          </div>
          <h2 className="font-display font-bold text-xl text-orbit-text">
            No saved events yet
          </h2>
          <p className="text-xs text-orbit-muted mt-2 leading-relaxed">
            Click the bookmark icon on any event card while exploring to keep track of upcoming meetups, workshops, and registrations.
          </p>
          <div className="mt-6">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg hover:bg-orbit-signalHover transition-all shadow-glow"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Free Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
