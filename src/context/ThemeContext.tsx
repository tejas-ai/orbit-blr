"use client";

import React, { createContext, useContext, useEffect } from "react";

// Dark is the only supported theme. Legacy calls remain safe no-ops so
// an old saved "light" preference can never change the website or PWA.
export type Theme = "dark";
export type ResolvedTheme = "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (_theme: string) => void;
  toggleTheme: () => void;
}

const darkOnly: ThemeContextType = {
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
};
const ThemeContext = createContext<ThemeContextType>(darkOnly);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // The HTML response already renders dark; this clears old local choices
    // installed PWAs may still have stored under the previous theme picker.
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    try {
      localStorage.removeItem("orbit_theme");
    } catch {
      // Private/restricted storage must not affect the forced dark design.
    }
  }, []);

  return <ThemeContext.Provider value={darkOnly}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
