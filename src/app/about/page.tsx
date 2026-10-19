import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShieldCheck,
  CheckCircle2,
  Compass,
  Building2,
  HelpCircle,
  Users,
  ArrowRight,
} from "lucide-react";
import VerificationEngineExplainer from "@/components/home/VerificationEngineExplainer";

export const metadata: Metadata = {
  title: "About ORBIT BLR — Bengaluru's Free In-Person Tech Directory",
  description:
    "Learn about ORBIT BLR's mission, our strict 7-point event verification standard, and how we help developers and students in Bengaluru discover authentic free tech opportunities.",
};

export default function AboutPage() {
  const faqs = [
    {
      q: "Are all events listed on ORBIT BLR really 100% free?",
      a: "Yes. Absolutely. We have a strict zero-admission policy. If an event charges for tickets, hides workshops behind paid entry passes, or requires paid subscriptions, it is permanently barred from our directory.",
    },
    {
      q: "How does ORBIT BLR verify attendee goodies and swag?",
      a: "We only mark goodies as 'Confirmed' when the official organiser explicitly states what swag will be provided (e.g. t-shirts, stickers, cloud vouchers) or when community evidence from preceding editions validates it. If it is raffle-based, we label it 'Limited / Raffle'. If unknown, it is marked 'Unverified'.",
    },
    {
      q: "What does 'Approval Required' mean?",
      a: "Many premier corporate tech offices in Bengaluru (such as Google RMZ Infinity, Amazon WTC, Cisco Cessna BP) require physical security pre-clearance. While registration is 100% free, you must wait for the organiser to approve your RSVP and send a confirmation email before arriving at the gate.",
    },
    {
      q: "How can community members submit or suggest an event?",
      a: "Anyone in the Bengaluru developer community can submit events via our 'Suggest an Event' form. Every submission enters our verification review queue and undergoes strict manual checks before going live.",
    },
    {
      q: "Is ORBIT BLR affiliated with Google, AWS, Microsoft, or other organizers?",
      a: "No. ORBIT BLR is an independent public directory built by the Bengaluru developer community. All company names, logos, and trademarks belong to their respective owners.",
    },
  ];

  return (
    <div className="space-y-12 py-6 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="border-b border-orbit-border/80 pb-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>About the Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-orbit-text tracking-tight">
          Built for Bengaluru&apos;s Builders, Hackers & Dreamers.
        </h1>
        <p className="text-base sm:text-lg text-orbit-muted leading-relaxed">
          Discover. Connect. Build. We believe that your next life-changing career opportunity, co-founder, or mentor in Bengaluru shouldn&apos;t be hidden behind fragmented event portals and paid paywalls.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orbit-surface flex items-center justify-center text-orbit-signal border border-orbit-border">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-lg text-orbit-text">The Problem We Solve</h2>
          <p className="text-xs text-orbit-muted leading-relaxed">
            Finding genuine free in-person tech events in Bengaluru requires searching through Meetup, Luma, Bevy, Discord servers, and LinkedIn posts. Many events claim to be free but sneak in paid fees later, or provide zero clarity on whether lunch or certificates are actually provided.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-orbit-surface flex items-center justify-center text-orbit-highlight border border-orbit-border">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-lg text-orbit-text">Our Verification Promise</h2>
          <p className="text-xs text-orbit-muted leading-relaxed">
            Every listing on ORBIT BLR is independently vetted. We record the exact last verification timestamp, verify physical venues across Bengaluru tech corridors, and separate verified facts from optimistic assumptions.
          </p>
        </div>
      </div>

      {/* Verification Engine Explainer Section */}
      <VerificationEngineExplainer />

      {/* FAQ Section */}
      <section className="space-y-6 pt-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-secondary uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-orbit-text tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-orbit-border/80 border-y border-orbit-border/80">
          {faqs.map((faq, index) => (
            <div key={index} className="py-5 space-y-2">
              <h3 className="font-display font-bold text-base text-orbit-text">
                {faq.q}
              </h3>
              <p className="text-xs text-orbit-muted leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Community Suggest Event CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-orbit-surface via-orbit-card to-orbit-surface border border-orbit-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-card">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-orbit-signal">
            <Users className="w-4 h-4" />
            <span>Community Contributions</span>
          </div>
          <h3 className="font-display font-bold text-xl text-orbit-text">
            Know an authentic free tech event in Bengaluru?
          </h3>
          <p className="text-xs text-orbit-muted max-w-lg leading-relaxed">
            Help the ecosystem discover worthwhile meetups, open-source workshops, and hackathons. All submissions undergo our strict 7-point verification audit before publishing.
          </p>
        </div>

        <Link
          href="/suggest"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg hover:bg-orbit-signalHover transition-all shrink-0"
        >
          <span>Suggest an Event</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
