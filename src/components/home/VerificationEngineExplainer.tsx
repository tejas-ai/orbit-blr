import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  MapPin,
  Gift,
  Award,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function VerificationEngineExplainer() {
  const steps = [
    {
      step: "01",
      title: "Original Organiser Identification",
      desc: "We verify the authentic developer community, tech firm (e.g. Google, AWS, Cisco, Thoughtworks), or academic institute running the event.",
      icon: Search,
    },
    {
      step: "02",
      title: "Direct Registration URL",
      desc: "Never redirected to generic homepages or affiliate landing pages. We link directly to official Bevy, Luma, Meetup, or custom portal forms.",
      icon: ExternalLink,
    },
    {
      step: "03",
      title: "In-Person Physical Bengaluru Venue",
      desc: "Every event is confirmed to happen in physical Bengaluru premises with exact address, landmark, and nearest Namma Metro station.",
      icon: MapPin,
    },
    {
      step: "04",
      title: "Genuinely Zero Cost Admission",
      desc: "No hidden charges, no 'free tier' sales pitches, and no paywalled certifications. 100% free entry is non-negotiable.",
      icon: CheckCircle2,
    },
    {
      step: "05",
      title: "Perk Evidence Verification",
      desc: "We never guess goodies, certificates, or food. Each perk is marked 'Confirmed', 'Limited', 'Conditional', or 'Unverified' based on evidence.",
      icon: Gift,
    },
    {
      step: "06",
      title: "Approval Requirement Flagging",
      desc: "If security clearance, corporate badge access, or RSVP vetting is required, it is prominently flagged so you aren't surprised at the gate.",
      icon: Award,
    },
    {
      step: "07",
      title: "Continuous Auditing & Pruning",
      desc: "Expired, moved, or cancelled events are immediately updated. Every listing showcases its exact last verification timestamp.",
      icon: RefreshCw,
    },
  ];

  return (
    <section id="verification" className="my-16 scroll-mt-24">
      <div className="bg-gradient-to-b from-[#140F26] to-[#0E0A1D] border border-purple-500/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-card">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>The Orbit BLR Trust Standard</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            How We Distinguish Verified Facts From Assumptions.
          </h2>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Unlike aggregators that scrape and republish low-quality links, every single listing on ORBIT BLR passes through our 7-point verification protocol before publication.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className={`p-5 rounded-2xl bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40 transition-all ${
                idx === 6 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  Step {s.step}
                </span>
                <s.icon className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="font-display font-bold text-base text-white tracking-tight mb-1.5">
                {s.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Verification Status Legend */}
        <div className="mt-8 pt-6 border-t border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Our strict perk labelling criteria:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              Confirmed = Explicit Organiser Proof
            </span>
            <span className="px-2.5 py-1 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Conditional = Lab / Attendance Dependent
            </span>
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Unverified = No Official Evidence Yet
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
