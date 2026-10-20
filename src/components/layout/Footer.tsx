"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { BENGALURU_AREAS } from "@/types/event";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-[#302B43] bg-white dark:bg-[#0E0E16] mt-16 text-xs text-slate-500 dark:text-[#CBD5E1] pb-16 md:pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3.5 md:col-span-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6A38EB] to-[#9333EA] flex items-center justify-center text-white font-bold text-xs">
                O
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-950 dark:text-[#F7F5FF] font-serif">
                ORBIT <span className="text-[#6A38EB] dark:text-[#A78BFA]">BLR</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-[#CBD5E1] leading-relaxed text-xs max-w-sm">
              Bengaluru&apos;s verified public registry for 100% free, in-person developer meetups, workshops, and hackathons. Always ₹0 admission, direct organiser registration links, and zero commercial paywalls.
            </p>
            <div className="pt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bengaluru Tech Nodes Synchronized</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-wider text-slate-900 dark:text-[#F7F5FF] font-bold mb-3.5">
              Platform Directory
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded">
                  Explore Verified Events
                </Link>
              </li>
              <li>
                <Link href="/explore?category=Hackathons" className="text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded">
                  Free Offline Hackathons
                </Link>
              </li>
              <li>
                <Link href="/saved" className="text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded">
                  My Saved Events
                </Link>
              </li>
              <li>
                <Link href="/suggest" className="text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded">
                  Submit a Tech Event
                </Link>
              </li>
              <li>
                <Link href="/about#verification" className="text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded">
                  Verification Standard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded">
                  About ORBIT BLR
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Bengaluru Tech Hubs */}
          <div className="md:col-span-4">
            <h4 className="text-xs uppercase tracking-wider text-slate-900 dark:text-[#F7F5FF] font-bold mb-3.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6A38EB] dark:text-[#A78BFA]" />
              <span>Bengaluru Tech Hubs</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {BENGALURU_AREAS.slice(0, 10).map((area) => (
                <Link
                  key={area}
                  href={`/explore?area=${encodeURIComponent(area)}`}
                  className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-[#151522] hover:bg-purple-50 dark:hover:bg-[#1D1B2C] text-slate-700 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] border border-slate-200/80 dark:border-[#302B43] dark:hover:border-[#4A4366] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Guarantee & Disclaimer Banner */}
        <div className="border-t border-slate-200/80 dark:border-[#302B43] pt-6 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-start gap-2 max-w-3xl">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Verification Standard:</strong> Every event on ORBIT BLR is checked for authentic zero-cost entry, organizer reputation, and physical Bengaluru venue details. Perks (refreshments, swags, certificates) are listed strictly where explicitly confirmed by organizers.
            </p>
          </div>

          <div className="shrink-0 text-slate-500 dark:text-[#CBD5E1]">
            © 2026 ORBIT BLR • Bengaluru, Karnataka
          </div>
        </div>
      </div>
    </footer>
  );
}
