"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { LogIn, LogOut, Bookmark, Shield, ChevronDown } from "lucide-react";
import SignInModal from "./SignInModal";
import { useSavedEvents } from "@/lib/useSavedEvents";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const { savedCount } = useSavedEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1E1830] animate-pulse" />
    );
  }

  // Not signed in: Show elegant "Sign In" button
  if (!session?.user) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] bg-slate-50 hover:bg-purple-50/60 dark:bg-[#151022] dark:hover:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] shadow-sm transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
          aria-label="Sign in to ORBIT BLR"
        >
          <LogIn className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#8B5CF6]" />
          <span>Sign In</span>
        </button>

        <SignInModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Signed in: Show profile avatar & account dropdown
  const user = session.user;
  const initials = (user.name || user.email || "U")
    .slice(0, 2)
    .toUpperCase();

  const provider = (user as unknown as Record<string, unknown>).provider as string | undefined;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-[#151022] dark:hover:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User profile"}
            width={26}
            height={26}
            className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#6A38EB] to-[#9333EA] text-white font-extrabold text-[10px] flex items-center justify-center">
            {initials}
          </div>
        )}
        <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-[#F7F5FF] max-w-[100px] truncate">
          {user.name || user.email?.split("@")[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Account Menu Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#151022] border border-purple-100 dark:border-[#2D224C] shadow-xl py-2 z-50 animate-fade-in space-y-1">
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#2D224C]">
            <p className="text-xs font-bold text-slate-950 dark:text-[#F7F5FF] truncate">
              {user.name || "ORBIT Explorer"}
            </p>
            {user.email && (
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                {user.email}
              </p>
            )}
            {provider && (
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-50 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/60 dark:border-[#382C58]">
                via {provider}
              </span>
            )}
          </div>

          {/* Links */}
          <div className="px-1.5">
            <Link
              href="/saved"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1D1B2C] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#6A38EB] dark:text-[#8B5CF6]" />
                <span>Saved Events</span>
              </div>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA]">
                  {savedCount}
                </span>
              )}
            </Link>

            <Link
              href="/privacy"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1D1B2C] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors"
            >
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Privacy Notice</span>
            </Link>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-slate-100 dark:border-[#2D224C] px-1.5">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
