"use client";

import React from "react";
import OrbitGlobe3D from "@/components/hero/OrbitGlobe3D";
import { Compass, ShieldCheck, ArrowRight, ChevronDown, Sparkles, MapPin, Gift, Award } from "lucide-react";

interface CinematicHeroProps {
  onSelectCategory?: (category: string) => void;
  onExploreClick?: () => void;
  totalEvents: number;
  swagCount: number;
  certCount: number;
  hubCount: number;
}

export default function CinematicHero({
  onSelectCategory,
  onExploreClick,
  totalEvents,
  swagCount,
  certCount,
  hubCount,
}: CinematicHeroProps) {
  const scrollToExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById("events-directory");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToVerification = () => {
    const el = document.getElementById("verification");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden pt-8 pb-6 md:pt-14 md:pb-10">
      {/* 1. CINEMATIC SUNSET ATMOSPHERIC LAYERS */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top-Right Sunset Glow */}
        <div className="absolute -top-32 right-1/4 w-[650px] h-[550px] bg-gradient-to-br from-orbit-pink/20 via-orbit-magenta/15 to-transparent blur-[120px] rounded-full" />
        {/* Center Electric Cyan Ambient */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] bg-gradient-to-tr from-orbit-signal/15 via-orbit-secondary/10 to-transparent blur-[110px] rounded-full" />
        {/* Bottom Sunset Horizon Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[220px] bg-gradient-to-t from-orbit-sunset/10 via-orbit-surface/50 to-transparent blur-2xl" />

        {/* Futuristic Perspective Grid */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-cyber-grid [mask-image:linear-gradient(to_bottom,transparent,black_70%)] opacity-40" />

        {/* Vector Skyline Silhouette of Bengaluru (Vidhana Soudha + UB City + Tech Corridors) */}
        <div className="absolute bottom-0 left-0 right-0 h-40 opacity-20 overflow-hidden">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Distant Tech Silhouettes */}
            <path
              d="M0 220V170H45V130H85V170H140V110H190V170H250V90H280L300 60L320 90H350V170H430V120H480V170H550V140H600V170H670V80H710L730 40L750 80H790V170H880V130H930V170H1000V100H1040V170H1120V125H1170V170H1250V70H1290V170H1360V140H1440V220H0Z"
              fill="#2E1052"
            />
            {/* Glowing Neon Outline */}
            <path
              d="M0 170H45V130H85V170H140V110H190V170H250V90H280L300 60L320 90H350V170H430V120H480V170H550V140H600V170H670V80H710L730 40L750 80H790V170H880V130H930V170H1000V100H1040V170H1120V125H1170V170H1250V70H1290V170H1360V140H1440"
              stroke="#00E5FF"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          </svg>
        </div>
      </div>

      {/* 2. HERO CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines, Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Neon Signal Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-orbit-surface/90 border border-orbit-pink/40 text-orbit-pink shadow-[0_0_20px_rgba(255,45,141,0.25)]">
              <span className="w-2 h-2 rounded-full bg-orbit-pink animate-ping" />
              <span>ORBIT BLR • THE CITY NEVER STOPS</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-orbit-text tracking-tight uppercase leading-[0.98]">
                THE CITY NEVER STOPS. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orbit-pink via-orbit-sunset to-orbit-signal">
                  NEITHER SHOULD YOUR AMBITION.
                </span>
              </h1>
              <p className="text-lg sm:text-2xl font-display font-bold text-orbit-text/90 tracking-tight pt-1">
                Discover Bengaluru&apos;s most exciting free technology events.
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-orbit-muted leading-relaxed max-w-2xl font-normal">
              Explore real developer meetups, AI sessions, cloud conferences, startup gatherings, and networking opportunities — independently verified with direct registration links.
            </p>

            {/* Key Value Guarantee Badges */}
            <div className="flex flex-wrap gap-2 text-xs font-mono pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-orbit-surface/80 border border-orbit-border flex items-center gap-1.5 text-orbit-text shadow-sm">
                <span className="text-emerald-400 font-bold">✓</span> ₹0 Admission Guaranteed
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-orbit-surface/80 border border-orbit-border flex items-center gap-1.5 text-orbit-text shadow-sm">
                <span className="text-orbit-signal font-bold">✓</span> 100% Verified Evidence
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-orbit-surface/80 border border-orbit-border flex items-center gap-1.5 text-orbit-text shadow-sm">
                <span className="text-orbit-pink font-bold">✓</span> Direct Organiser Links
              </span>
            </div>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={scrollToExplore}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl font-mono text-xs sm:text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-orbit-signal to-orbit-signalHover hover:from-orbit-signalHover hover:to-orbit-signal text-orbit-bg shadow-[0_0_25px_rgba(0,229,255,0.4)] hover:shadow-[0_0_35px_rgba(0,229,255,0.6)] transition-all transform active:scale-95"
              >
                <Compass className="w-4 h-4" />
                <span>EXPLORE EVENTS</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                type="button"
                onClick={scrollToVerification}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider bg-orbit-surface/90 hover:bg-orbit-surfaceHover text-orbit-text border border-orbit-border hover:border-orbit-pink/50 transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-orbit-pink" />
                <span>HOW VERIFICATION WORKS</span>
              </button>
            </div>
          </div>

          {/* Right Column: Upgraded 3D Bengaluru Radar Node Network */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full relative">
              <OrbitGlobe3D onSelectCategory={onSelectCategory} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. LIVE DATABASE METRICS BAR & SCROLL INDICATOR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-10">
        {/* Genuine Live Database Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-orbit-card/85 backdrop-blur-xl border border-orbit-border/80 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orbit-signal/15 border border-orbit-signal/30 flex items-center justify-center text-orbit-signal shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-display font-black text-orbit-text">
                {totalEvents}
              </div>
              <div className="text-[11px] font-mono text-orbit-muted uppercase tracking-wider">
                Free Tech Events Live
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orbit-pink/15 border border-orbit-pink/30 flex items-center justify-center text-orbit-pink shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-display font-black text-orbit-text">
                {swagCount}
              </div>
              <div className="text-[11px] font-mono text-orbit-muted uppercase tracking-wider">
                Confirmed Goodies
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orbit-secondary/15 border border-orbit-secondary/30 flex items-center justify-center text-orbit-secondary shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-display font-black text-orbit-text">
                {certCount}
              </div>
              <div className="text-[11px] font-mono text-orbit-muted uppercase tracking-wider">
                Verified Certificates
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orbit-sunset/15 border border-orbit-sunset/30 flex items-center justify-center text-orbit-sunset shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-display font-black text-orbit-text">
                {hubCount || "Bengaluru"}
              </div>
              <div className="text-[11px] font-mono text-orbit-muted uppercase tracking-wider">
                Tech Corridors
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Scroll Indicator */}
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={scrollToExplore}
            className="group inline-flex flex-col items-center gap-1.5 text-orbit-muted/70 hover:text-orbit-signal transition-colors font-mono text-[11px] tracking-widest uppercase"
          >
            <span>SCROLL TO EXPLORE EVENTS</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-orbit-signal" />
          </button>
        </div>
      </div>
    </section>
  );
}
