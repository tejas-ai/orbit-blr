"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

export default function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const buttonSize = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative ${buttonSize} rounded-full flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 ${
        isDark
          ? "bg-[#1D1B2C] text-amber-300 hover:text-amber-200 border border-[#302B43] hover:border-[#4A4366] shadow-[0_0_12px_rgba(251,191,36,0.15)] active:scale-95"
          : "bg-slate-50 text-slate-700 hover:text-[#6A38EB] border border-slate-200 hover:border-purple-200 hover:bg-purple-50/50 shadow-sm active:scale-95"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center overflow-hidden">
        {/* Sun Icon (shown in dark mode to switch to light, or vice versa) */}
        <Sun
          className={`${iconSize} transition-all duration-300 absolute ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-300"
              : "rotate-90 scale-0 opacity-0 text-slate-700"
          }`}
        />
        {/* Moon Icon (shown in light mode to switch to dark) */}
        <Moon
          className={`${iconSize} transition-all duration-300 absolute ${
            isDark
              ? "-rotate-90 scale-0 opacity-0 text-amber-300"
              : "rotate-0 scale-100 opacity-100 text-slate-700"
          }`}
        />
      </div>
    </button>
  );
}
