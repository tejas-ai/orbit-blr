import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import {
  ShieldCheck,
  CheckCircle2,
  Compass,
  Building2,
  HelpCircle,
  Users,
  ArrowRight,
  Github,
  Linkedin,
  ArrowUpRight,
} from "lucide-react";
import VerificationEngineExplainer from "@/components/home/VerificationEngineExplainer";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "About ORBIT BLR — Created by Tejas Handigol",
  description:
    "Learn about ORBIT BLR, created by Tejas Handigol, and how the platform helps Bengaluru discover verified free in-person tech events and hackathons.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About ORBIT BLR — Created by Tejas Handigol",
    description:
      "Learn about ORBIT BLR, created by Tejas Handigol, and how the platform helps Bengaluru discover verified free in-person tech events and hackathons.",
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "About ORBIT BLR — Verification Standard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About ORBIT BLR — Created by Tejas Handigol",
    description:
      "Learn about ORBIT BLR's mission and strict 7-point verification standard.",
    images: ["/og-image.png"],
  },
};

export default function AboutPage() {
  const faqs = [
    {
      q: "Are all events listed on ORBIT BLR really 100% free?",
      a: "Yes. Absolutely. We enforce a strict zero-admission policy. If an event charges for tickets, hides workshops behind paid entry passes, or requires paid subscriptions, it is permanently barred from our directory.",
    },
    {
      q: "How does ORBIT BLR verify attendee goodies and swag?",
      a: "We only mark goodies as 'Confirmed' when the official organiser explicitly states what swag will be provided (e.g. t-shirts, stickers, cloud vouchers) or when organizer evidence validates it. If it is raffle-based, we label it 'Limited / Raffle'. If unknown, it is marked 'Unverified'.",
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
      a: "No. ORBIT BLR is an independent public directory created by Tejas Handigol for the Bengaluru developer community. All company names, logos, and trademarks belong to their respective owners.",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-7 pt-4 pb-6 sm:pt-5 sm:pb-7 max-w-4xl mx-auto px-4 sm:px-6 bg-white dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] transition-colors duration-300">
      {/* Hero Header */}
      <ScrollReveal direction="down" className="border-b border-slate-200/80 dark:border-[#302B43] pb-5 space-y-3 pt-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>About the Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
          Built for Bengaluru&apos;s Builders, Hackers &amp; Dreamers.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-[#CBD5E1] leading-relaxed font-normal">
          Discover. Connect. Build. We believe that your next career opportunity, co-founder, or mentor in Bengaluru shouldn&apos;t be hidden behind fragmented event portals and paid paywalls.
        </p>
      </ScrollReveal>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ScrollReveal staggerIndex={1} className="p-6 rounded-3xl bg-slate-50 dark:bg-[#1D1B2C] border border-slate-200/80 dark:border-[#302B43] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#151522] flex items-center justify-center text-[#6A38EB] dark:text-[#A78BFA] border border-purple-100 dark:border-[#302B43]">
            <Compass className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-950 dark:text-[#F7F5FF] font-serif">The Problem We Solve</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
            Finding genuine free in-person tech events in Bengaluru requires searching through Meetup, Luma, Bevy, Discord servers, and LinkedIn posts. Many events claim to be free but sneak in paid fees later, or provide zero clarity on whether lunch or certificates are actually provided.
          </p>
        </ScrollReveal>

        <ScrollReveal staggerIndex={2} className="p-6 rounded-3xl bg-slate-50 dark:bg-[#1D1B2C] border border-slate-200/80 dark:border-[#302B43] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#151522] flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-[#302B43]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg text-slate-950 dark:text-[#F7F5FF] font-serif">Our Verification Promise</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
            Every listing on ORBIT BLR is independently vetted. We record the exact last verification timestamp, verify physical venues across Bengaluru tech corridors, and separate verified facts from optimistic assumptions.
          </p>
        </ScrollReveal>
      </div>

      {/* Public creator attribution; rendered on the server for accessibility and discoverability. */}
      <section id="creator" aria-labelledby="creator-heading" className="relative overflow-hidden rounded-3xl border border-[#4B3A72]/80 bg-[#171526]/95 p-5 sm:p-7">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#6A38EB]/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#6A38EB]/50 bg-[#261C3D] shadow-lg shadow-violet-950/40 sm:h-28 sm:w-28">
            <Image
              src="/creator/tejas-handigol.webp"
              alt="Tejas Handigol, creator and developer of ORBIT BLR"
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#B99EFF]">Creator &amp; Developer</p>
            <h2 id="creator-heading" className="mt-1 font-serif text-2xl font-extrabold tracking-tight text-[#F7F5FF] sm:text-3xl">Tejas Handigol</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#CBD5E1]">
              ORBIT BLR was conceived, designed, and developed by Tejas Handigol, a Computer Science (AI &amp; ML) student in Bengaluru. The platform helps people discover genuinely free, in-person tech events and hackathons across the city.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <a href="https://github.com/tejas-ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#544373] bg-[#241D39] px-4 py-2.5 text-xs font-semibold text-[#E5DBFF] transition-colors hover:border-[#A78BFA] hover:bg-[#33264C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]">
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a href="https://www.linkedin.com/in/tejashandigol/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/40 bg-[#1C2438] px-4 py-2.5 text-xs font-semibold text-[#E8F1FF] transition-colors hover:border-[#60A5FA] hover:bg-[#24304A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]">
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Engine Explainer Section */}
      <VerificationEngineExplainer />

      {/* FAQ Section */}
      <section className="space-y-6 pt-4">
        <ScrollReveal direction="down" className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
            Frequently Asked Questions
          </h2>
        </ScrollReveal>

        <div className="divide-y divide-slate-200 dark:divide-[#302B43] border-y border-slate-200 dark:border-[#302B43]">
          {faqs.map((faq, index) => (
            <ScrollReveal key={index} staggerIndex={index % 3} className="py-4 space-y-2">
              <h3 className="font-bold text-base text-slate-950 dark:text-[#F7F5FF] font-serif">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                {faq.a}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Suggest CTA */}
      <ScrollReveal direction="down" className="p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-indigo-50/50 dark:from-[#1D1B2C] dark:via-[#191629] dark:to-[#1D1B2C] border border-purple-200 dark:border-[#302B43] text-center space-y-3 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF] font-serif">
          Know an upcoming free tech event in Bengaluru?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] max-w-md mx-auto">
          Help the community by submitting the official event link for independent verification.
        </p>
        <div className="pt-2">
          <Link
            href="/suggest"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white transition-all shadow-sm active:scale-95"
          >
            <span>Submit a Meetup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
