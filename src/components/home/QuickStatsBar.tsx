import React from "react";
import { ShieldCheck, Gift, Award, MapPin, Zap } from "lucide-react";

interface QuickStatsBarProps {
  totalEvents: number;
  swagCount: number;
  certCount: number;
  hubCount: number;
}

export default function QuickStatsBar({
  totalEvents,
  swagCount,
  certCount,
  hubCount,
}: QuickStatsBarProps) {
  const stats = [
    {
      label: "Free In-Person Events",
      value: totalEvents,
      icon: Zap,
      color: "text-orbit-signal",
      sub: "100% Free RSVP",
    },
    {
      label: "Confirmed Free Swags",
      value: swagCount,
      icon: Gift,
      color: "text-orbit-signal",
      sub: "T-Shirts, Stickers & Cloud Credits",
    },
    {
      label: "Confirmed Certificates",
      value: certCount,
      icon: Award,
      color: "text-orbit-secondary",
      sub: "Digital & Cryptographic Badges",
    },
    {
      label: "Bengaluru Tech Hubs",
      value: hubCount,
      icon: MapPin,
      color: "text-orbit-highlight",
      sub: "Koramangala, HSR, ORR & more",
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-orbit-card/60 backdrop-blur-md border border-orbit-border hover:border-orbit-borderLight p-4 rounded-2xl transition-all shadow-card flex items-start gap-3.5"
        >
          <div className="p-2.5 rounded-xl bg-orbit-surface border border-orbit-border shrink-0">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-orbit-text tracking-tight flex items-baseline gap-1">
              <span>{stat.value}</span>
              <span className="text-xs font-mono font-normal text-orbit-subtle">+</span>
            </div>
            <div className="text-xs font-mono text-orbit-text font-semibold mt-0.5">
              {stat.label}
            </div>
            <div className="text-[11px] text-orbit-subtle mt-0.5 line-clamp-1">
              {stat.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
