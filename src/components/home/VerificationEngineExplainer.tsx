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
      desc: "We never guess goodies, certificates, or food. Each perk is marked 'Confirmed', 'Limited', 'Conditional', or 'Unverified' strictly based on evidence.",
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
    <section id="verification" className="my-12 scroll-mt-24 transition-colors">
      <div className="bg-gradient-to-b from-[#FAF9FF] to-white dark:from-[#1D1B2C] dark:to-[#151522] border border-purple-200/80 dark:border-[#302B43] rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-[#151522] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200 dark:border-[#302B43] mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>The ORBIT BLR Trust Standard</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
            How We Distinguish Verified Facts From Assumptions.
          </h2>
          <p className="text-sm text-slate-600 dark:text-[#CBD5E1] mt-2 leading-relaxed">
            Unlike aggregators that scrape and republish unvetted links, every single listing on ORBIT BLR passes through our 7-point verification protocol before publication.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.step}
              className={`p-5 rounded-2xl bg-white dark:bg-[#1D1B2C] border border-slate-200/80 dark:border-[#302B43] hover:border-purple-300 dark:hover:border-[#8B5CF6]/50 transition-all shadow-sm ${
                idx === 6 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] bg-purple-50 dark:bg-[#151522] px-2 py-0.5 rounded-full border border-purple-100 dark:border-[#302B43]">
                  Step {s.step}
                </span>
                <s.icon className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-[#F7F5FF] tracking-tight mb-1 font-serif">
                {s.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
