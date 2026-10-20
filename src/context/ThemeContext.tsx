"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [, startTransition] = useTransition();

  useEffect(() => {
    // 1. Initialise theme from localStorage or system preference
    try {
      const storedTheme = localStorage.getItem("orbit_theme") as Theme | null;
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeState(storedTheme);
        setResolvedTheme(storedTheme);
        applyThemeClass(storedTheme);
      } else {
        setThemeState("system");
        const initialResolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(initialResolved);
        applyThemeClass(initialResolved);
      }

      // 2. Listen to system preference changes when in 'system' mode
      const handleMediaChange = (e: MediaQueryListEvent) => {
        const currentStored = localStorage.getItem("orbit_theme");
        if (!currentStored || currentStored === "system") {
          const newResolved = e.matches ? "dark" : "light";
          startTransition(() => {
            setResolvedTheme(newResolved);
            applyThemeClass(newResolved);
          });
        }
      };

      mediaQuery.addEventListener("change", handleMediaChange);
      return () => mediaQuery.removeEventListener("change", handleMediaChange);
    } catch {
      // Safe fallback if localStorage or matchMedia is inaccessible
    }
  }, []);

  const applyThemeClass = (active: ResolvedTheme) => {
    const root = document.documentElement;
    if (active === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    try {
      if (newTheme === "system") {
        localStorage.removeItem("orbit_theme");
        setThemeState("system");
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const newResolved = systemDark ? "dark" : "light";
        setResolvedTheme(newResolved);
        applyThemeClass(newResolved);
      } else {
        localStorage.setItem("orbit_theme", newTheme);
        setThemeState(newTheme);
        setResolvedTheme(newTheme);
        applyThemeClass(newTheme);
      }
    } catch {
      // Ignore storage errors in restricted iframe/browser modes
    }
  };

  const toggleTheme = () => {
    // Direct binary toggle between light and dark
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
