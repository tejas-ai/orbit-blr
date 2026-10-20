"use client";

import React from "react";
import { Zap, Brain, Code2, ShieldAlert, Cloud, Flame, Sparkles } from "lucide-react";

interface CategoryTileGridProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryTileGrid({
  selectedCategory,
  onSelectCategory,
}: CategoryTileGridProps) {
  const categoryTiles = [
    {
      id: "all",
      label: "All Events",
      subtext: "Explore everything",
      icon: Sparkles,
      color: "text-purple-400",
      bgGradient: "from-purple-500/20 to-transparent",
    },
    {
      id: "Hackathons",
      label: "Hackathons",
      subtext: "Build, sprint & win",
      icon: Zap,
      color: "text-amber-400",
      bgGradient: "from-amber-500/20 to-transparent",
    },
    {
      id: "AI & ML",
      label: "AI & ML",
      subtext: "LLMs, Agents & Vision",
      icon: Brain,
      color: "text-purple-300",
      bgGradient: "from-purple-500/20 to-transparent",
    },
    {
      id: "Developer",
      label: "Developer",
      subtext: "Code, Kotlin & Systems",
      icon: Code2,
      color: "text-sky-400",
      bgGradient: "from-sky-500/20 to-transparent",
    },
    {
      id: "Cybersecurity",
      label: "Cybersecurity",
      subtext: "OWASP, Null & SecOps",
      icon: ShieldAlert,
      color: "text-emerald-400",
      bgGradient: "from-emerald-500/20 to-transparent",
    },
    {
      id: "Cloud",
      label: "Cloud & Scale",
      subtext: "AWS, Azure & Kubernetes",
      icon: Cloud,
      color: "text-indigo-400",
      bgGradient: "from-indigo-500/20 to-transparent",
    },
  ];

  return (
    <div className="space-y-4 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
            Explore Your Interests
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase">
            WHATEVER YOU&apos;RE INTO,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-100 to-white">
              IT&apos;S HERE.
            </span>
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Curated streams across Bengaluru tech corridors
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryTiles.map((tile) => {
          const isSelected =
            (tile.id === "all" && (selectedCategory === "all" || !selectedCategory)) ||
            selectedCategory.toLowerCase() === tile.id.toLowerCase();

          const Icon = tile.icon;

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onSelectCategory(tile.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? "bg-[#18112E] border-purple-500 shadow-md ring-1 ring-purple-500/50"
                  : "bg-[#120D24] hover:bg-[#18112E] border-purple-500/20 hover:border-purple-500/40"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-white/[0.05] border border-purple-500/20 flex items-center justify-center mb-3 ${tile.color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <strong className="block text-sm font-display font-bold text-white group-hover:text-purple-300 transition-colors">
                  {tile.label}
                </strong>
                <span className="block text-[11px] font-mono text-slate-400 truncate">
                  {tile.subtext}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
