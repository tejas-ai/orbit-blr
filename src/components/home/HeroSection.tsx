"use client";

import React from "react";
import Link from "next/link";
import OrbitGlobe3D from "@/components/hero/OrbitGlobe3D";
import { Compass, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onSelectCategory?: (category: string) => void;
  onExploreClick?: () => void;
}

export default function HeroSection({ onSelectCategory, onExploreClick }: HeroSectionProps) {
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
    <section className="relative pt-6 pb-12 md:pt-12 md:pb-16 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-orbit-signal/15 via-orbit-highlight/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline and Call to Actions */}
        <div className="lg:col-span-6 space-y-6 text-left z-10">
          {/* Signal Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-orbit-surface/90 border border-orbit-signal/30 text-orbit-signal shadow-glow">
            <span className="w-2 h-2 rounded-full bg-orbit-signal animate-ping" />
            <span>ORBIT BLR • 100% FREE IN-PERSON TECH DIRECTORY</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-orbit-text tracking-tight leading-[1.08]">
            Your next opportunity is <span className="text-transparent bg-clip-text bg-gradient-to-r from-orbit-signal via-orbit-highlight to-orbit-secondary">closer than you think</span>.
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-orbit-muted leading-relaxed max-w-xl">
            Discover Bengaluru&apos;s best free tech events, meet extraordinary people, and unlock opportunities worth showing up for.
          </p>

          {/* Key Value Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-mono text-orbit-subtle pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-orbit-surface/80 border border-orbit-border flex items-center gap-1.5 text-orbit-text">
              <span className="text-orbit-signal">✓</span> Zero Registration Fee
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orbit-surface/80 border border-orbit-border flex items-center gap-1.5 text-orbit-text">
              <span className="text-orbit-signal">✓</span> Verified Swag & Certificates
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-orbit-surface/80 border border-orbit-border flex items-center gap-1.5 text-orbit-text">
              <span className="text-orbit-signal">✓</span> Direct Organiser Links
            </span>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={scrollToExplore}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-sm font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg shadow-glow hover:shadow-glowCyan transition-all transform active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Free Events</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={scrollToVerification}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-sm font-medium bg-orbit-surface/90 hover:bg-orbit-border text-orbit-text border border-orbit-border hover:border-orbit-borderLight transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-orbit-signal" />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive 3D Orbit Globe */}
        <div className="lg:col-span-6 relative z-10 flex items-center justify-center">
          <div className="w-full relative">
            <OrbitGlobe3D onSelectCategory={onSelectCategory} />
          </div>
        </div>
      </div>
    </section>
  );
}
