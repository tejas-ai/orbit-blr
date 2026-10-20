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
  Home,
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
      <div className="w-full bg-[#140F24] text-purple-200 border-b border-purple-500/20 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider py-1.5 px-3 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-center truncate">
          <span className="flex items-center gap-1.5 text-purple-300 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>VERIFIED TECH EXPERIENCES</span>
          </span>
          <span className="text-purple-400/40 hidden sm:inline">•</span>
          <span className="text-white/90 hidden xs:inline shrink-0">ALWAYS ₹0 TO ATTEND</span>
          <span className="text-purple-400/40 hidden md:inline">•</span>
          <span className="text-purple-300/70 hidden md:inline truncate">ORGANISER-FIRST LINKS ONLY</span>
        </div>
      </div>

      {/* 2. STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-purple-500/20 bg-[#0B0813]/95 backdrop-blur-2xl shadow-md py-2"
            : "border-b border-white/5 bg-[#0B0813]/80 backdrop-blur-md py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Logo & Location Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1.5px] shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all">
                <div className="w-full h-full bg-[#0B0813] rounded-[10px] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-base sm:text-lg tracking-wider text-white group-hover:text-purple-300 transition-colors">
                  ORBIT
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  BLR
                </span>
              </div>
            </Link>

            {/* Location Pill */}
            <Link
              href="/explore"
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-purple-500/20 text-slate-300 hover:text-white text-xs font-mono transition-all"
              title="Active Region: Bengaluru"
            >
              <MapPin className="w-3 h-3 text-purple-400" />
              <span className="font-semibold text-white">Bengaluru</span>
              <span className="text-[10px] text-slate-400">• 54+ Nodes</span>
            </Link>
          </div>

          {/* Center: Desktop Navigation — Shown on xl+ screens (1280px+) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {link.icon && <link.icon className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Quick Search, Saved Events & Suggest CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Search Shortcut */}
            <Link
              href="/explore"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-purple-500/20 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
              title="Search verified events"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="hidden 2xl:inline text-slate-400">Search events...</span>
            </Link>

            {/* Saved Events Button with Badge */}
            <Link
              href="/saved"
              className={`relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/saved"
                  ? "bg-purple-600/30 text-purple-200 border-purple-500/50"
                  : "bg-white/[0.04] text-slate-300 hover:text-white border-purple-500/20 hover:border-purple-500/40"
              }`}
              title="Saved Events"
            >
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
              <span className="hidden sm:inline font-mono">My Events</span>
              {savedCount > 0 && (
                <span
                  data-testid="saved-count-badge"
                  className="w-4 h-4 rounded-full bg-purple-500 text-white font-extrabold text-[10px] flex items-center justify-center"
                >
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Suggest Event CTA — on wide screens */}
            <Link
              href="/suggest"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Suggest Event</span>
            </Link>

            {/* Mobile / Tablet menu trigger (screens below xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] border border-purple-500/20"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#0F0A1E]/98 border-b border-purple-500/20 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-mono flex items-center gap-2.5 ${
                    isActive(link.href)
                      ? "bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-purple-400" />}
                  <span>{link.label}</span>
                </Link>
              ))}
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-mono flex items-center justify-between text-slate-400 hover:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  <span>My Saved Events</span>
                </div>
                {savedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </Link>
              <Link
                href="/suggest"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-mono flex items-center gap-2.5 text-white font-extrabold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 rounded-xl mt-3"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Suggest Free Tech Event</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. MOBILE BOTTOM NAVIGATION (Excluded on event detail page) */}
      {!isEventDetailPage && (
        <nav
          aria-label="Mobile bottom navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0813]/95 backdrop-blur-xl border-t border-purple-500/20 px-3 py-2 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]"
        >
          <div className="grid grid-cols-4 items-center">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/"
                  ? "text-purple-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-mono">Home</span>
            </Link>

            <Link
              href="/explore"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/explore" && activeCategory !== "Hackathons"
                  ? "text-purple-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[10px] font-mono">Explore</span>
            </Link>

            <Link
              href="/explore?category=Hackathons"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                activeCategory === "Hackathons"
                  ? "text-amber-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-mono text-amber-300">Hackathons</span>
            </Link>

            <Link
              href="/saved"
              className={`relative flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/saved"
                  ? "text-purple-400 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-[10px] font-mono">Saved</span>
              {savedCount > 0 && (
                <span className="absolute top-0 right-4 w-4 h-4 rounded-full bg-purple-500 text-white font-extrabold text-[9px] flex items-center justify-center">
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
