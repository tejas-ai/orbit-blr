"use client";

import { useEffect, useState } from "react";
import { isHackathonEvent } from "@/lib/hackathons";
import type { OrbitEvent } from "@/types/event";

type EventFeed = "all" | "events" | "hackathons";

const POLL_INTERVAL_MS = 60_000;

/**
 * Keep an open page in sync with verified, published events from the public API.
 * The server-rendered initial list remains visible if the network is unavailable.
 */
export function useLiveEvents(initialEvents: OrbitEvent[], feed: EventFeed = "all"): OrbitEvent[] {
  const [events, setEvents] = useState<OrbitEvent[]>(initialEvents);

  // Support Next.js client navigation / refreshed server props.
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    const controller = new AbortController();

    const refresh = async () => {
      if (!active || inFlight || document.visibilityState === "hidden" || !navigator.onLine) {
        return;
      }

      inFlight = true;
      try {
        const response = await fetch(`/api/events?type=${feed}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload: unknown = await response.json();
        if (
          !payload ||
          typeof payload !== "object" ||
          !("success" in payload) ||
          payload.success !== true ||
          !("events" in payload) ||
          !Array.isArray(payload.events)
        ) {
          return;
        }

        const incoming: OrbitEvent[] = payload.events;
        if (
          !incoming.every(
            (event) =>
              event &&
              typeof event.id === "string" &&
              typeof event.category === "string" &&
              event.publication_status === "published"
          )
        ) {
          return;
        }

        // Even if an API regression sends a mixed list, do not mix directories.
        const nextEvents = incoming.filter((event) =>
          feed === "all" ? true : feed === "hackathons" ? isHackathonEvent(event) : !isHackathonEvent(event)
        );

        if (active) {
          setEvents((previous) =>
            JSON.stringify(previous) === JSON.stringify(nextEvents) ? previous : nextEvents
          );
        }
      } catch {
        // Keep displaying the last valid list during transient network failures.
      } finally {
        inFlight = false;
      }
    };

    const onReturn = () => {
      if (document.visibilityState === "visible") void refresh();
    };

    const timer = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    window.addEventListener("online", onReturn);
    void refresh();

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
      window.removeEventListener("online", onReturn);
    };
  }, [feed]);

  return events;
}
