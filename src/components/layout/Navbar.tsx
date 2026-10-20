"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSavedEvents } from "@/lib/useSavedEvents";
import {
  Compass,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { savedCount } = useSavedEvents();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Explore Events", href: "/explore", icon: Compass },
    { label: "How It Works", href: "/about#verification", icon: ShieldCheck },
    { label: "About Orbit", href: "/about", icon: null },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/about#")) return false;
    return pathname === href;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-orbit-border/90 bg-orbit-bg/95 backdrop-blur-2xl shadow-card py-2.5"
          : "border-b border-transparent bg-orbit-bg/40 backdrop-blur-md py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo — Vice City meets Bengaluru Tech */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orbit-pink via-orbit-magenta to-orbit-signal p-[1.5px] shadow-[0_0_20px_rgba(255,45,141,0.35)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all">
            <div className="w-full h-full bg-orbit-bg rounded-[10px] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orbit-pink to-orbit-signal animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-wider text-white group-hover:text-orbit-signal transition-colors">
                ORBIT
              </span>
              <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-orbit-pink/20 to-orbit-signal/20 text-orbit-signal border border-orbit-signal/30">
                BLR
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-orbit-muted uppercase -mt-1 hidden sm:block">
              Free Tech Events
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-orbit-surface text-orbit-signal border border-orbit-signal/40 shadow-glow"
                    : "text-orbit-muted hover:text-orbit-text hover:bg-orbit-surface/60"
                }`}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5 text-orbit-signal" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Saved Events Button */}
          <Link
            href="/saved"
            className={`relative p-2.5 rounded-xl border text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              pathname === "/saved"
                ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/50 shadow-glow"
                : "bg-orbit-surface/80 text-orbit-muted hover:text-orbit-text border-orbit-border hover:border-orbit-signal/30"
            }`}
            title="Saved Events"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">My Events</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orbit-signal text-orbit-bg font-extrabold text-[10px] flex items-center justify-center shadow-glow">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Suggest Event CTA */}
          <Link
            href="/suggest"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-orbit-signal to-orbit-signalHover hover:from-orbit-signalHover hover:to-orbit-signal text-orbit-bg shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all transform active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Suggest Event</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-orbit-muted hover:text-orbit-text bg-orbit-surface border border-orbit-border"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-orbit-pink" /> : <Menu className="w-5 h-5 text-orbit-text" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-orbit-bg/95 border-b border-orbit-border px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-mono flex items-center gap-2.5 ${
                  isActive(link.href)
                    ? "bg-orbit-surface text-orbit-signal font-bold border border-orbit-signal/30"
                    : "text-orbit-muted hover:text-orbit-text"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-orbit-signal" />}
                <span>{link.label}</span>
              </Link>
            ))}
            <Link
              href="/saved"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-mono flex items-center justify-between text-orbit-muted hover:text-orbit-text"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-orbit-signal" />
                <span>My Saved Events</span>
              </div>
              {savedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-orbit-signal text-orbit-bg font-bold text-[10px] flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>
            <Link
              href="/suggest"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-mono flex items-center gap-2.5 text-orbit-bg font-extrabold uppercase tracking-wider bg-orbit-signal shadow-glow mt-3"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Suggest Free Tech Event</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
