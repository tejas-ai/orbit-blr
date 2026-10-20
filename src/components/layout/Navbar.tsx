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
      setIsScrolled(window.scrollY > 10);
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
    if (href.startsWith("/about#")) return pathname === "/about";
    return pathname === href;
  };

  return (
    <>
      {/* 1. TOPLINE VERIFICATION BANNER */}
      <div className="w-full bg-[#FAF9FF] text-[#6A38EB] border-b border-purple-100 text-[10px] sm:text-[11px] font-medium tracking-wide py-1.5 px-3 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-center truncate">
          <span className="flex items-center gap-1.5 font-bold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>VERIFIED TECH EXPERIENCES</span>
          </span>
          <span className="text-purple-300 hidden sm:inline">•</span>
          <span className="text-slate-700 hidden xs:inline shrink-0 font-semibold">ALWAYS ₹0 TO ATTEND</span>
          <span className="text-purple-300 hidden md:inline">•</span>
          <span className="text-slate-500 hidden md:inline truncate">DIRECT ORGANISER REGISTRATION ONLY</span>
        </div>
      </div>

      {/* 2. STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm py-2"
            : "border-b border-slate-200/60 bg-white/90 backdrop-blur-sm py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand Logo & Location Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#6A38EB] to-[#9333EA] flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
                O
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 font-serif">
                  ORBIT
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#6A38EB]">
                  BLR
                </span>
              </div>
            </Link>

            {/* Location Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#6A38EB]" />
              <span>Bengaluru, India</span>
            </div>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const isHack = link.label === "Hackathons";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-purple-50 text-[#6A38EB] font-bold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
                >
                  {isHack ? (
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <link.icon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Saved Events & Suggest CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Search Shortcut */}
            <Link
              href="/explore"
              className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
              title="Search verified events"
              aria-label="Search verified events"
            >
              <Search className="w-4 h-4 text-slate-500" />
            </Link>

            {/* Saved Events Button with Badge */}
            <Link
              href="/saved"
              className={`relative p-2 rounded-full border transition-all flex items-center gap-1.5 ${
                pathname === "/saved"
                  ? "bg-purple-50 text-[#6A38EB] border-purple-200"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-[#6A38EB]"
              }`}
              title="Saved Events"
              aria-label="Saved Events"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span
                  data-testid="saved-count-badge"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6A38EB] text-white font-extrabold text-[9px] flex items-center justify-center shadow"
                >
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Suggest Event CTA */}
            <Link
              href="/suggest"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Submit Meetup</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-lg">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 text-xs font-semibold mb-2">
              <MapPin className="w-4 h-4 text-[#6A38EB]" />
              <span>Bengaluru, India • Verified Tech Calendar</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                    isActive(link.href)
                      ? "bg-purple-50 text-[#6A38EB] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <link.icon className="w-4 h-4 text-[#6A38EB]" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-slate-700 hover:bg-slate-50"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-[#6A38EB]" />
                  <span>Saved Events</span>
                </div>
                {savedCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#6A38EB] text-white font-bold text-[10px] flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </Link>
              <Link
                href="/suggest"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-white bg-slate-900 hover:bg-slate-800 mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Submit Meetup / Hackathon</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 3. MOBILE BOTTOM NAVIGATION (Excluded on event detail page) */}
      {!isEventDetailPage && (
        <nav
          aria-label="Mobile bottom navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-3 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="grid grid-cols-4 items-center">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/"
                  ? "text-[#6A38EB] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            <Link
              href="/explore"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/explore" && activeCategory !== "Hackathons"
                  ? "text-[#6A38EB] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-medium">Explore</span>
            </Link>

            <Link
              href="/explore?category=Hackathons"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                activeCategory === "Hackathons"
                  ? "text-amber-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-medium">Hackathons</span>
            </Link>

            <Link
              href="/saved"
              className={`relative flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors ${
                pathname === "/saved"
                  ? "text-[#6A38EB] font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-[10px] font-medium">Saved</span>
              {savedCount > 0 && (
                <span className="absolute top-0 right-3.5 w-3.5 h-3.5 rounded-full bg-[#6A38EB] text-white font-bold text-[8px] flex items-center justify-center">
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
