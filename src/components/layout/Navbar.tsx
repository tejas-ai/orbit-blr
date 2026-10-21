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
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";

export default function Navbar() {
  const pathname = usePathname();
  const { savedCount } = useSavedEvents();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isEventDetailPage = pathname.startsWith("/events/");

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
    { label: "Hackathons", href: "/hackathons", icon: Zap },
    { label: "Verification Standard", href: "/about#verification", icon: ShieldCheck },
  ];

  const isActive = (href: string) => {
    if (href === "/hackathons" || href === "/explore") return pathname === href;
    if (href.startsWith("/about#")) return pathname === "/about";
    return pathname === href;
  };

  return (
    <>
      {/* STICKY HEADER */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-slate-200/90 dark:border-[#302B43] bg-white/95 dark:bg-[#0E0E16]/95 backdrop-blur-md shadow-sm py-2"
            : "border-b border-slate-200/60 dark:border-[#302B43]/70 bg-white/90 dark:bg-[#0E0E16]/90 backdrop-blur-sm py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand Logo & Location Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-xl">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#6A38EB] to-[#9333EA] flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
                O
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 dark:text-[#F7F5FF] font-serif">
                  ORBIT
                </span>
                <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#6A38EB] dark:text-[#A78BFA]">
                  BLR
                </span>
              </div>
            </Link>

            {/* Location Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-[#151522] border border-slate-200/80 dark:border-[#302B43] text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
              <MapPin className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
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
                  
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                    active
                      ? "bg-purple-50 text-[#6A38EB] dark:bg-[#1D1B2C] dark:text-[#A78BFA] dark:border dark:border-[#302B43] font-bold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50 dark:text-[#CBD5E1] dark:hover:text-[#F7F5FF] dark:hover:bg-[#151522]"
                  }`}
                >
                  {isHack ? (
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <link.icon className="w-3.5 h-3.5 text-slate-400 dark:text-[#A78BFA]" />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Search, Saved Events, Theme Toggle & Suggest CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Search Shortcut */}
            <Link
              href="/explore"
              
              className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-[#151522] dark:hover:bg-[#1D1B2C] border border-slate-200 dark:border-[#302B43] text-slate-600 hover:text-slate-900 dark:text-[#CBD5E1] dark:hover:text-[#F7F5FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
              title="Search verified events"
              aria-label="Search verified events"
            >
              <Search className="w-4 h-4 text-slate-500 dark:text-[#CBD5E1]" />
            </Link>

            {/* Saved Events Button with Badge */}
            <Link
              href="/saved"
              className={`relative p-2 rounded-full border transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                pathname === "/saved"
                  ? "bg-purple-50 text-[#6A38EB] border-purple-200 dark:bg-[#1D1B2C] dark:text-[#A78BFA] dark:border-[#8B5CF6]/50"
                  : "bg-slate-50 hover:bg-slate-100 dark:bg-[#151522] dark:hover:bg-[#1D1B2C] border-slate-200 dark:border-[#302B43] text-slate-700 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA]"
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

            {/* Desktop Theme Switcher */}
            <div className="hidden sm:block">
              <ThemeToggle size="md" />
            </div>

            {/* Desktop User Account / Sign In */}
            <div className="hidden sm:block">
              <UserMenu />
            </div>

            {/* Suggest Event CTA */}
            <Link
              href="/suggest"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white text-xs font-semibold shadow-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Submit Meetup</span>
            </Link>

            {/* Mobile Controls: User Menu, Theme Toggle & Hamburger */}
            <div className="flex sm:hidden items-center gap-1.5">
              <UserMenu />
              <ThemeToggle size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 dark:text-[#F7F5FF] hover:bg-slate-100 dark:hover:bg-[#1D1B2C] border border-slate-200 dark:border-[#302B43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-[#F7F5FF]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#0E0E16] border-t border-slate-200 dark:border-[#302B43] px-4 pt-3 pb-5 space-y-2 shadow-lg">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-[#151522] text-purple-900 dark:text-[#F7F5FF] text-xs font-semibold mb-2 border border-purple-100/60 dark:border-[#302B43]">
              <MapPin className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
              <span>Bengaluru, India • Verified Tech Calendar</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                    isActive(link.href)
                      ? "bg-purple-50 text-[#6A38EB] dark:bg-[#1D1B2C] dark:text-[#A78BFA] font-bold"
                      : "text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#151522] dark:hover:text-[#F7F5FF]"
                  }`}
                >
                  <link.icon className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <Link
                href="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#151522] dark:hover:text-[#F7F5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
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
                className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 text-white bg-slate-900 hover:bg-slate-800 dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
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
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E0E16]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#302B43] px-3 py-1.5 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]"
        >
          <div className="grid grid-cols-4 items-center">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                pathname === "/"
                  ? "text-[#6A38EB] dark:text-[#A78BFA] font-bold"
                  : "text-slate-500 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF]"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>

            <Link
              href="/explore"
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                pathname === "/explore"
                  ? "text-[#6A38EB] dark:text-[#A78BFA] font-bold"
                  : "text-slate-500 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF]"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-medium">Explore</span>
            </Link>

            <Link
              href="/hackathons"
              
              className={`flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                pathname === "/hackathons"
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-slate-500 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF]"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span className="text-[10px] font-medium">Hackathons</span>
            </Link>

            <Link
              href="/saved"
              className={`relative flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                pathname === "/saved"
                  ? "text-[#6A38EB] dark:text-[#A78BFA] font-bold"
                  : "text-slate-500 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF]"
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
