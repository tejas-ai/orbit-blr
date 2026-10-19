"use client";

import React, { useState } from "react";
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
  Lock,
  Terminal,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { savedCount } = useSavedEvents();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Explore Events", href: "/explore", icon: Compass },
    { label: "How It Works", href: "/about#verification", icon: ShieldCheck },
    { label: "About Orbit", href: "/about", icon: null },
    { label: "AI Integration API", href: "/docs/ai-integration", icon: Terminal },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/about#")) return false;
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orbit-border/80 bg-orbit-bg/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orbit-signal to-orbit-highlight p-[1px] shadow-glow">
            <div className="w-full h-full bg-orbit-bg rounded-[11px] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-orbit-signal animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-lg tracking-wider text-orbit-text group-hover:text-orbit-signal transition-colors">
                ORBIT
              </span>
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-orbit-signal/20 text-orbit-signal border border-orbit-signal/30">
                BLR
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-orbit-subtle uppercase -mt-1 hidden sm:block">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-orbit-surface text-orbit-signal border border-orbit-border"
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
        <div className="flex items-center gap-2.5">
          {/* Saved Events Button */}
          <Link
            href="/saved"
            className={`relative p-2 rounded-xl border text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
              pathname === "/saved"
                ? "bg-orbit-signal/15 text-orbit-signal border-orbit-signal/40"
                : "bg-orbit-surface text-orbit-muted hover:text-orbit-text border-orbit-border hover:border-orbit-borderLight"
            }`}
            title="Saved Events"
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">My Events</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orbit-signal text-orbit-bg font-bold text-[10px] flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Suggest Event CTA */}
          <Link
            href="/suggest"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg shadow-sm hover:shadow-glow transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Suggest Event</span>
          </Link>

          {/* Admin shortcut icon */}
          <Link
            href="/admin"
            className="p-2 rounded-xl text-orbit-subtle hover:text-orbit-signal transition-colors"
            title="Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-orbit-muted hover:text-orbit-text bg-orbit-surface border border-orbit-border"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-orbit-text" />}
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
                    ? "bg-orbit-surface text-orbit-signal font-bold"
                    : "text-orbit-muted hover:text-orbit-text"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4 text-orbit-signal" />}
                <span>{link.label}</span>
              </Link>
            ))}
            <Link
              href="/suggest"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-mono flex items-center gap-2.5 text-orbit-signal font-bold bg-orbit-signal/10 border border-orbit-signal/20 mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Suggest Free Tech Event</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-xs font-mono text-orbit-subtle flex items-center gap-2 pt-2 border-t border-orbit-border/50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Management Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
