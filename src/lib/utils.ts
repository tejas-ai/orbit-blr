import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { OrbitEvent } from "@/types/event";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date into human-friendly IST representation
// e.g. "Sat, 25 Oct 2026"
export function formatEventDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

// Format time in IST
// e.g. "10:30 AM IST"
export function formatEventTime(startIso: string, endIso?: string): string {
  try {
    const start = new Date(startIso);
    const startTimeStr = start.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (!endIso) {
      return `${startTimeStr} IST`;
    }

    const end = new Date(endIso);
    const endTimeStr = end.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${startTimeStr} - ${endTimeStr} IST`;
  } catch {
    return "Time TBA";
  }
}

// Format relative verification timestamp
export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "Not yet verified";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Verified just now";
    if (diffHours < 24) return `Verified ${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Verified yesterday";
    if (diffDays < 30) return `Verified ${diffDays} days ago`;
    return `Verified on ${formatEventDate(isoString)}`;
  } catch {
    return "Recently verified";
  }
}

import { SITE_URL } from "@/lib/site";

// Generate Google Calendar Link
export function getGoogleCalendarUrl(event: OrbitEvent): string {
  const formatUtcDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const startUtc = formatUtcDate(event.start_at);
  const endUtc = formatUtcDate(event.end_at);
  const location = `${event.venue}, ${event.area}, Bengaluru, Karnataka, India`;
  const details = `${event.description}\n\nOfficial Registration: ${event.registration_url}\n\nDiscovered via ORBIT BLR (${SITE_URL}/events/${event.slug})`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${startUtc}/${endUtc}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate ICS file content for downloading calendar event
export function generateIcsContent(event: OrbitEvent): string {
  const formatIcsDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const nowIcs = formatIcsDate(new Date().toISOString());
  const startIcs = formatIcsDate(event.start_at);
  const endIcs = formatIcsDate(event.end_at);
  const location = `${event.venue}, ${event.area}, Bengaluru`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Orbit BLR//Bengaluru Free Tech Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    // Preserve existing calendar event UID for subscriber stability
    `UID:${event.id}@orbitblr.in`,
    `DTSTAMP:${nowIcs}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")} \\n\\nOfficial Register: ${event.registration_url} \\n\\nEvent Details: ${SITE_URL}/events/${event.slug}`,
    `URL:${SITE_URL}/events/${event.slug}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
