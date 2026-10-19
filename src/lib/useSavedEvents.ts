"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "orbit_blr_saved_events";

export function useSavedEvents() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedIds(JSON.parse(stored));
      }
    } catch {
      // Local storage disabled or error
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save to localStorage", err);
      }
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return {
    savedIds,
    toggleSave,
    isSaved,
    isLoaded,
    savedCount: savedIds.length,
  };
}
