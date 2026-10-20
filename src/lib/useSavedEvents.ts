"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "orbit_blr_saved_events";
const CHANGE_EVENT = "orbit_blr_saved_events_changed";

export function useSavedEvents() {
  const { data: session, status } = useSession();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncedUserIdRef = useRef<string | null>(null);

  const syncFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedIds(JSON.parse(stored));
      } else {
        setSavedIds([]);
      }
    } catch {
      // Local storage disabled or error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen to cross-component storage changes
  useEffect(() => {
    syncFromStorage();

    const handleStorageChange = () => {
      syncFromStorage();
    };

    window.addEventListener(CHANGE_EVENT, handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(CHANGE_EVENT, handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [syncFromStorage]);

  // Non-destructive cloud merge when signed in
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && syncedUserIdRef.current !== session.user.id) {
      syncedUserIdRef.current = session.user.id;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const localIds: string[] = stored ? JSON.parse(stored) : [];

        fetch("/api/user/saved-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localIds }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.savedIds && Array.isArray(data.savedIds)) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data.savedIds));
              setSavedIds(data.savedIds);
              window.dispatchEvent(new Event(CHANGE_EVENT));
            }
          })
          .catch((err) => {
            console.warn("Could not sync saved events to server:", err);
          });
      } catch (err) {
        console.warn("Storage read error during cloud sync:", err);
      }
    } else if (status === "unauthenticated") {
      syncedUserIdRef.current = null;
    }
  }, [status, session]);

  const toggleSave = useCallback(
    (id: string) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const current: string[] = stored ? JSON.parse(stored) : [];
        const next = current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id];

        // Optimistic local update
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setSavedIds(next);
        window.dispatchEvent(new Event(CHANGE_EVENT));

        // If authenticated, sync change to server
        if (session?.user?.id) {
          fetch("/api/user/saved-events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId: id }),
          }).catch((err) => {
            console.warn("Background bookmark sync failed:", err);
          });
        }
      } catch (err) {
        console.error("Failed to save to localStorage", err);
      }
    },
    [session]
  );

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return {
    savedIds,
    toggleSave,
    isSaved,
    isLoaded,
    savedCount: savedIds.length,
  };
}
