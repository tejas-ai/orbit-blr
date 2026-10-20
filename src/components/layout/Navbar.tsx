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
  MapPin,
  Search,
  Sparkles,
  Home,
  Flame,
  Zap,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { savedCount } = useSavedEvents();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isEventDetailPage = pathname.startsWith("/events/");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setActiveCategory(params.get("category"));
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "For You", href: "/", icon: Home },
    { label: "Explore Events", href: "/explore", icon: Compass },
    { label: "Hackathons", href: "/explore?category=Hackathons", icon: Zap },
    { label: "Verification Standard", href: "/about#verification", icon: ShieldCheck },
  ];

  const isActive = (href: string) => {
    if (href === "/explore?category=Hackathons") {
      return pathname === "/explore" && activeCategory === "Hackathons";
    }
    if (href === "/explore") {
      return pathname === "/explore" && activeCategory !== "Hackathons";
    }
    if (href.startsWith("/about#")) return false;
    return pathname === href;
  };

  return (
    <>
      {/* 1. TOPLINE VERIFICATION BANNER */}
      <div className="w-full bg-[#1b123d] text-[#e5ddff] border-b border-[#2d1d52] text-[10px] sm:text-[11px] font-mono font-bold tracking-wider py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-4 truncate">
          <span className="flex items-center gap-1.5 text-orbit-highlight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VERIFIED TECH EXPERIENCES</span>
          </span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="text-white/90">ALWAYS ₹0 TO ATTEND</span>
          <span className="text-white/40 hidden sm:inline">•</span>
          <span className="text-orbit-muted hidden sm:inline">ORGANISER-FIRST LINKS ONLY</span>
        </div>
      </div>

      {/* 2. STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-orbit-border/90 bg-orbit-bg/95 backdrop-blur-2xl shadow-card py-2.5"
            : "border-b border-white/5 bg-orbit-bg/80 backdrop-blur-md py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Location Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-orbit-pink via-orbit-secondary to-orbit-signal p-[1.5px] shadow-[0_0_20px_rgba(255,45,141,0.35)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.5)] transition-all">
                <div className="w-full h-full bg-orbit-bg rounded-[10px] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orbit-pink to-orbit-signal animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white group-hover:text-orbit-signal transition-colors">
                    ORBIT
                  </span>
                  <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-orbit-pink/20 to-orbit-signal/20 text-orbit-signal border border-orbit-signal/30">
                    BLR
                  </span>
                </div>
                <span className="text-[9px] font-mono tracking-widest text-orbit-muted uppercase -mt-1 hidden sm:block">
                  100% Free Events
                </span>
              </div>
            </Link>

            {/* Location Pill */}
            <Link
              href="/explore"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orbit-surface/80 border border-orbit-border text-orbit-muted hover:text-orbit-text hover:border-orbit-signal/40 text-xs font-mono transition-all"
              title="Active Region: Bengaluru"
            >
              <MapPin className="w-3 h-3 text-orbit-sunset" />
              <span className="font-semibold text-white">Bengaluru</span>
              <span className="text-[10px] text-orbit-subtle">• 54+ Nodes</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-orbit-surface text-orbit-signal border border-orbit-signal/40 shadow-glow font-bold"
                      : "text-orbit-muted hover:text-orbit-text hover:bg-orbit-surface/60"
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5 text-orbit-signal" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Search, Saved Events & Suggest CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Search Shortcut */}
            <Link
              href="/explore"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-orbit-surface/80 hover:bg-orbit-surface border border-orbit-border text-orbit-muted hover:text-orbit-text text-xs font-mono flex items-center gap-2 transition-all"
              title="Search verified events"
            >
              <Search className="w-4 h-4 text-orbit-signal" />
              <span className="hidden lg:inline text-orbit-subtle">Search events...</span>
            </Link>

            {/* Saved Events Button with Badge */}
            <Link
              href="/saved"
              className={`relative p-2 sm:px-3 sm:py-2 rounded-xl border text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/saved"
                  ? "bg-orbit-signal/20 text-orbit-signal border-orbit-signal/50 shadow-glow"
                  : "bg-orbit-surface/80 text-orbit-muted hover:text-orbit-text border-orbit-border hover:border-orbit-signal/30"
              }`}
              title="Saved Events"
            >
              <Bookmark className="w-4 h-4 text-orbit-signal" />
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
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-orbit-signal to-orbit-signalHover hover:from-orbit-signalHover hover:to-orbit-signal text-orbit-bg shadow-[0_0_20px_rgba(0,229,255,0.35)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all transform active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Suggest Event</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-orbit-muted hover:text-orbit-text bg-orbit-surface border border-orbit-border"
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

      {/* 3. MOBILE BOTTOM NAVIGATION (Excluded on event detail page to prevent conflict with mobile booking bar) */}
      {!isEventDetailPage && (
        <nav
          aria-label="Mobile bottom navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-orbit-bg/95 backdrop-blur-xl border-t border-orbit-border px-3 py-2 shadow-[0_-8px_20px_rgba(0,0,0,0.4)]"
        >
          <div className="grid grid-cols-4 items-center">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/"
                  ? "text-orbit-signal font-bold"
                  : "text-orbit-muted hover:text-orbit-text"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-mono">Home</span>
            </Link>

            <Link
              href="/explore"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/explore" && activeCategory !== "Hackathons"
                  ? "text-orbit-signal font-bold"
                  : "text-orbit-muted hover:text-orbit-text"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-mono">Explore</span>
            </Link>

            <Link
              href="/explore?category=Hackathons"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                activeCategory === "Hackathons"
                  ? "text-orbit-signal font-bold"
                  : "text-orbit-muted hover:text-orbit-text"
              }`}
            >
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-amber-300">Hackathons</span>
            </Link>

            <Link
              href="/saved"
              className={`relative flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/saved"
                  ? "text-orbit-signal font-bold"
                  : "text-orbit-muted hover:text-orbit-text"
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] font-mono">Saved</span>
              {savedCount > 0 && (
                <span className="absolute top-0 right-4 w-4 h-4 rounded-full bg-orbit-signal text-orbit-bg font-extrabold text-[9px] flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
