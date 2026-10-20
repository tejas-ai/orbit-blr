"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Sparkles, ArrowRight, ShieldCheck, Bookmark, Zap, Loader2, X, Compass } from "lucide-react";

export default function WelcomeOverlay() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user previously dismissed in this browser session
    const stored = typeof window !== "undefined" ? sessionStorage.getItem("orbit_welcome_dismissed") : "true";
    setIsDismissed(stored === "true");
  }, []);

  // Lock body scroll while modal is visible
  useEffect(() => {
    const shouldLock = mounted && status === "unauthenticated" && !isDismissed;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mounted, status, isDismissed]);

  // Support ESC key to dismiss as guest
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleExploreAsGuest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent flash while loading session or if authenticated or dismissed
  if (!mounted || status === "loading" || status === "authenticated" || isDismissed) {
    return null;
  }

  const handleGitHubSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn("github", { callbackUrl: "/" });
    } catch (err) {
      console.error("GitHub Sign In error:", err);
      setIsSigningIn(false);
    }
  };

  const handleExploreAsGuest = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("orbit_welcome_dismissed", "true");
    }
    setIsDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 dark:bg-[#07050E]/85 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleExploreAsGuest();
      }}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6A38EB]/25 dark:bg-[#8B5CF6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-[#3B82F6]/15 dark:bg-[#6366F1]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Welcome Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white/95 dark:bg-[#120D22]/95 border border-purple-100 dark:border-[#382C58] shadow-[0_25px_60px_-15px_rgba(106,56,235,0.25)] p-6 sm:p-10 space-y-7 transition-all duration-300 backdrop-blur-2xl">
        {/* Subtle Skip / Close button */}
        <button
          onClick={handleExploreAsGuest}
          aria-label="Skip to homepage"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-[#F7F5FF] hover:bg-slate-100 dark:hover:bg-[#1E1633] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Kicker & Gleaming Icon */}
        <div className="text-center space-y-4 pt-1">
          {/* Orbital Logo Mark */}
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#6A38EB] via-[#8B5CF6] to-[#A855F7] text-white shadow-[0_10px_25px_-5px_rgba(106,56,235,0.4)] ring-4 ring-purple-100/80 dark:ring-[#382C58]/60 mx-auto transition-transform hover:scale-105 duration-300">
            <div className="relative flex items-center justify-center">
              <span className="font-extrabold text-2xl sm:text-3xl font-serif">O</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#120D22] animate-pulse" />
            </div>
          </div>

          {/* Community Badge */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-[#201738] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/80 dark:border-[#3E2E66]">
              <Sparkles className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
              <span>Bengaluru Tech Community</span>
            </div>
          </div>

          {/* Heading */}
          <h1
            id="welcome-modal-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif pt-1"
          >
            Welcome to ORBIT BLR
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#CBD5E1] font-medium leading-relaxed max-w-md mx-auto">
            Your gateway to Bengaluru&apos;s verified free tech events, developer meetups, and hackathons.
          </p>
        </div>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-[#1A132E]/80 border border-slate-100 dark:border-[#2C214A]">
            <ShieldCheck className="w-4 h-4 mx-auto text-[#6A38EB] dark:text-[#A78BFA] mb-1" />
            <div className="text-[11px] font-bold text-slate-900 dark:text-[#F7F5FF]">100% Free</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Verified RSVP</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-[#1A132E]/80 border border-slate-100 dark:border-[#2C214A]">
            <Zap className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <div className="text-[11px] font-bold text-slate-900 dark:text-[#F7F5FF]">Top Meetups</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">AI, Dev & Hack</div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-[#1A132E]/80 border border-slate-100 dark:border-[#2C214A]">
            <Bookmark className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
            <div className="text-[11px] font-bold text-slate-900 dark:text-[#F7F5FF]">Cloud Sync</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Cross-Device</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary Action: Continue with GitHub */}
          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-950 dark:bg-[#6A38EB] hover:bg-slate-900 dark:hover:bg-[#5826D4] text-white text-sm sm:text-base font-bold shadow-lg shadow-purple-950/20 dark:shadow-purple-900/30 transition-all transform active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            {isSigningIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                />
              </svg>
            )}
            <span>{isSigningIn ? "Connecting to GitHub..." : "Continue with GitHub"}</span>
          </button>

          {/* Secondary Action: Explore as Guest */}
          <button
            type="button"
            onClick={handleExploreAsGuest}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100/80 dark:bg-[#1A132E] hover:bg-slate-200/80 dark:hover:bg-[#251A40] text-slate-700 dark:text-[#E2E8F0] hover:text-slate-950 dark:hover:text-white border border-slate-200/90 dark:border-[#382C58] text-xs sm:text-sm font-bold shadow-sm transition-all transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          >
            <Compass className="w-4 h-4 text-slate-500 dark:text-[#A78BFA]" />
            <span>Explore as Guest</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Supporting Explanation Text */}
        <p className="text-[11px] sm:text-xs text-center text-slate-500 dark:text-[#94A3B8] font-medium leading-relaxed italic pt-1 border-t border-slate-100 dark:border-[#2C214A]/80">
          Sign in to save events, sync your bookmarks, and personalize your experience.
        </p>
      </div>
    </div>
  );
}
