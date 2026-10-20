import React from "react";
import Link from "next/link";
import { ShieldCheck, MapPin } from "lucide-react";
import { BENGALURU_AREAS } from "@/types/event";

export default function Footer() {
  return (
    <footer className="border-t border-orbit-border/90 bg-orbit-surface/80 mt-20 text-xs text-orbit-muted backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3.5 md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl tracking-wider text-white">
                ORBIT <span className="text-transparent bg-clip-text bg-gradient-to-r from-orbit-pink to-orbit-signal">BLR</span>
              </span>
            </div>
            <p className="text-orbit-muted leading-relaxed text-xs max-w-sm">
              Bengaluru&apos;s verified directory for 100% free, in-person technology meetups, workshops, and networking events.
            </p>
            <div className="pt-2 text-[11px] font-mono text-orbit-subtle flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bengaluru Tech Nodes Synchronized</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-orbit-text font-bold mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-pink" />
              <span>Platform</span>
            </h4>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <Link href="/explore" className="hover:text-orbit-signal transition-colors">
                  Explore Free Events
                </Link>
              </li>
              <li>
                <Link href="/saved" className="hover:text-orbit-signal transition-colors">
                  My Saved Events
                </Link>
              </li>
              <li>
                <Link href="/suggest" className="hover:text-orbit-signal transition-colors">
                  Suggest an Event
                </Link>
              </li>
              <li>
                <Link href="/about#verification" className="hover:text-orbit-signal transition-colors">
                  7-Step Verification Engine
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-orbit-signal transition-colors">
                  About Orbit BLR
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Bengaluru Tech Hubs */}
          <div className="md:col-span-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-orbit-text font-bold mb-3.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orbit-signal" />
              <span>Bengaluru Tech Hubs</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {BENGALURU_AREAS.slice(0, 10).map((area) => (
                <Link
                  key={area}
                  href={`/explore?area=${encodeURIComponent(area)}`}
                  className="px-2.5 py-1 rounded-lg bg-orbit-card hover:bg-orbit-surfaceHover text-orbit-muted hover:text-orbit-signal border border-orbit-border hover:border-orbit-signal/30 transition-colors"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="border-t border-orbit-border/80 pt-6 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-orbit-subtle">
          <div className="flex items-start gap-2 max-w-3xl">
            <ShieldCheck className="w-4 h-4 text-orbit-signal shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-orbit-muted font-medium">Independent Directory Notice:</strong> ORBIT BLR is an independent public event discovery directory. We are not officially affiliated with Google, Amazon, Microsoft, Cisco, or any listed event organizers. All trademarks, company names, and logos belong to their respective owners. Every event is vetted for genuinely free admission prior to publishing.
            </p>
          </div>
          <div className="font-mono shrink-0">
            Built for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orbit-pink to-orbit-signal font-bold">Bengaluru Developer Ecosystem</span>.
          </div>
        </div>
      </div>
    </footer>
  );
}
