"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Building2, Train } from "lucide-react";

interface Hub {
  name: string;
  tagline: string;
  majorTechPresences: string;
  metroInfo: string;
  eventCount: number;
}

const HUBS: Hub[] = [
  {
    name: "Koramangala",
    tagline: "Startup Capital & Developer Hub",
    majorTechPresences: "Thoughtworks, Razorpay HQ, Draper Startup House, BHIVE",
    metroInfo: "Upcoming Yellow Line / Direct bus routes",
    eventCount: 3,
  },
  {
    name: "HSR Layout",
    tagline: "GenAI & Founder Epicenter",
    majorTechPresences: "BHIVE 272, Builders Club, Hustle Coworking",
    metroInfo: "Silk Board Metro Interchange (Yellow/Blue Line)",
    eventCount: 2,
  },
  {
    name: "Bellandur / Outer Ring Road",
    tagline: "Enterprise Cloud & SRE Corridor",
    majorTechPresences: "Cisco Cessna BP, Intel, JP Morgan, PhonePe",
    metroInfo: "ORR Bus Rapid Transit / Kadubeesanahalli",
    eventCount: 2,
  },
  {
    name: "Whitefield",
    tagline: "Deep Tech & Cloud Native R&D",
    majorTechPresences: "SAP Labs India, KTPO, TCS, Mercedes-Benz R&D",
    metroInfo: "Kundalahalli & Whitefield Metro (Purple Line)",
    eventCount: 2,
  },
  {
    name: "Old Madras Road / Indiranagar",
    tagline: "Hyperscaler Tech & Developer Meetups",
    majorTechPresences: "Google India (RMZ Infinity), Indiranagar cafes",
    metroInfo: "Baiyappanahalli & Swami Vivekananda Road Metro",
    eventCount: 2,
  },
  {
    name: "Malleshwaram / IISc",
    tagline: "Science, Robotics & Cloud Centers",
    majorTechPresences: "Amazon WTC, Indian Institute of Science (IISc)",
    metroInfo: "Sandal Soap Factory & Yeshwanthpur Metro (Green Line)",
    eventCount: 2,
  },
];

export default function BengaluruRadarMap() {
  return (
    <section className="my-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>Bengaluru Geography</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-orbit-text tracking-tight">
            Explore Free Events by Bengaluru Tech District
          </h2>
          <p className="text-xs sm:text-sm text-orbit-muted mt-1.5">
            Bengaluru&apos;s tech ecosystem is distributed across distinctive corridors. Filter by the tech park closest to you.
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal hover:underline shrink-0"
        >
          <span>View All Locations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {HUBS.map((hub) => (
          <Link
            key={hub.name}
            href={`/explore?area=${encodeURIComponent(hub.name)}`}
            className="group block p-5 rounded-2xl bg-orbit-card hover:bg-orbit-cardHover border border-orbit-border hover:border-orbit-signal/40 transition-all shadow-card hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-bold text-base text-orbit-text group-hover:text-orbit-signal transition-colors">
                {hub.name}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orbit-surface text-orbit-highlight border border-orbit-border">
                {hub.eventCount} Active
              </span>
            </div>

            <div className="text-xs text-orbit-signal font-mono mb-2.5">
              {hub.tagline}
            </div>

            <div className="space-y-1.5 text-xs text-orbit-muted pt-2 border-t border-orbit-border/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-orbit-subtle shrink-0" />
                <span className="line-clamp-1">{hub.majorTechPresences}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-orbit-subtle">
                <Train className="w-3.5 h-3.5 text-orbit-secondary shrink-0" />
                <span className="line-clamp-1">{hub.metroInfo}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
