"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "orbit_blr_saved_events";
const CHANGE_EVENT = "orbit_blr_saved_events_changed";

export function useSavedEvents() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const toggleSave = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: string[] = stored ? JSON.parse(stored) : [];
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedIds(next);
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch (err) {
      console.error("Failed to save to localStorage", err);
    }
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return {
    savedIds,
    toggleSave,
    isSaved,
    isLoaded,
    savedCount: savedIds.length,
  };
}
