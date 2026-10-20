import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getEventBySlug } from "@/lib/db";
import { getEventThumbnail } from "@/lib/thumbnails";
import { isHackathonEvent, extractHackathonDetails } from "@/lib/hackathons";
import {
  RegistrationBadge,
  GoodiesBadge,
  CertificateBadge,
  FoodBadge,
  FreeEntryPill,
} from "@/components/events/VerificationBadges";
import EventDetailsActions from "@/components/events/EventDetailsActions";
import EventHeroBanner from "@/components/events/EventHeroBanner";
import { formatEventDate, formatEventTime, formatRelativeTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Train,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Gift,
  Award,
  Coffee,
  Users,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Navigation,
  FileCheck2,
  Zap,
  Timer,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found — ORBIT BLR",
    };
  }

  const thumb = getEventThumbnail(event);

  return {
    title: `${event.name} — Free Tech Event in Bengaluru | ORBIT BLR`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: `${event.name} — Free Tech Event in Bengaluru`,
      description: event.description.slice(0, 160),
      url: `https://orbit-blr.vercel.app/events/${event.slug}`,
      siteName: "ORBIT BLR",
      type: "website",
      images: [
        {
          url: thumb.src,
          alt: thumb.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.name} — ORBIT BLR`,
      description: event.description.slice(0, 160),
      images: [thumb.src],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const thumbnailData = getEventThumbnail(event);
  const isHack = isHackathonEvent(event);
  const hackathon = extractHackathonDetails(event);
  const displayCategory = isHack ? "Hackathons" : event.category;

  // Schema.org Event structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.start_at,
    endDate: event.end_at,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address || event.venue,
        addressLocality: event.area,
        addressRegion: "Karnataka",
        postalCode: "560001",
        addressCountry: "IN",
      },
    },
    image: [thumbnailData.src],
    description: event.description,
    offers: {
      "@type": "Offer",
      url: event.registration_url,
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      validFrom: event.created_at,
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer,
      url: event.registration_url,
    },
  };

  const navSections = [
    { id: "overview", label: "Overview" },
    ...(hackathon.isHackathon ? [{ id: "hackathon", label: "Hackathon Format" }] : []),
    ...(event.topics_covered?.length || event.who_should_attend?.length
      ? [{ id: "topics", label: "Topics & Audience" }]
      : []),
    ...(event.agenda?.length ? [{ id: "schedule", label: "Schedule" }] : []),
    { id: "perks", label: "Verified Perks" },
    { id: "venue", label: "Venue & Transit" },
    { id: "audit", label: "Verification Audit" },
  ];

  return (
    <>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-36 lg:pb-16">
        {/* Breadcrumb Navigation with Safe Mobile Truncation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/" className="hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <Link href="/explore" className="hover:text-purple-300 transition-colors shrink-0">
            Explore Events
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-white truncate max-w-[130px] xs:max-w-[200px] sm:max-w-xs md:max-w-md font-semibold">
            {event.name}
          </span>
        </nav>

        {/* ============================================================== */}
        {/* 1. DISTRICT-STYLE WIDESCREEN MEDIA BANNER & HERO HEADER       */}
        {/* ============================================================== */}
        <EventHeroBanner
          event={event}
          initialSrc={thumbnailData.src}
          alt={thumbnailData.alt}
          displayCategory={displayCategory}
          isHack={isHack}
        />

        {/* ============================================================== */}
        {/* 2. DISTRICT SECTION NAVIGATION BAR                             */}
        {/* ============================================================== */}
        <div className="sticky top-16 z-30 bg-[#0B0813]/95 backdrop-blur-md py-2 border-y border-purple-500/20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full">
            {navSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-purple-500/20 transition-all whitespace-nowrap"
              >
                {sec.label}
              </a>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. TWO-COLUMN EDITORIAL CONTENT GRID                           */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ------------------------------------------------------------ */}
          {/* Left Column: Event Overview, Hackathon Rules, Agenda, Perks  */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-8 space-y-8">
            {/* 3.1 Overview / Description */}
            <section
              id="overview"
              className="scroll-mt-28 bg-orbit-card border border-orbit-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4"
            >
              <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orbit-signal" />
                <span>About This Event</span>
              </h2>
              <div className="text-sm text-orbit-muted leading-relaxed space-y-3 font-normal whitespace-pre-line font-sans">
                {event.description}
              </div>

              {/* Explicit Host Admission Rule Disclaimer */}
              <div className="mt-4 p-4 rounded-2xl bg-orbit-surface/70 border border-orbit-border/80 text-xs text-orbit-muted space-y-1">
                <div className="flex items-center gap-2 text-white font-bold font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Official Admission Protocol</span>
                </div>
                <p className="leading-relaxed">
                  Registration happens directly on the verified organiser&apos;s website. An open RSVP or application does not guarantee physical entry unless the host confirms your ticket or approval email. ORBIT BLR does not issue tickets or charge fees.
                </p>
              </div>
            </section>

            {/* 3.2 Hackathon Specific Specifications (If Hackathon) */}
            {hackathon.isHackathon && (
              <section
                id="hackathon"
                className="scroll-mt-28 bg-orbit-card border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-card space-y-5"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Zap className="w-5 h-5" />
                  <h2 className="text-xl font-display font-bold text-white tracking-tight">
                    Hackathon Specifications & Rules
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hackathon.teamSize && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                        Team Formation
                      </span>
                      <strong className="text-sm text-white font-mono flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>{hackathon.teamSize}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.registrationDeadline && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                        Application Deadline
                      </span>
                      <strong className="text-sm text-white font-mono flex items-center gap-1.5">
                        <Timer className="w-4 h-4 text-amber-400" />
                        <span>{hackathon.registrationDeadline}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.duration && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                        Sprint Duration
                      </span>
                      <strong className="text-sm text-white font-mono flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>{hackathon.duration}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.eligibility && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 sm:col-span-2 lg:col-span-3">
                      <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                        Eligibility & Participant Criteria
                      </span>
                      <strong className="text-xs text-white font-mono flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span>{hackathon.eligibility}</span>
                      </strong>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 3.3 Topics & Audience */}
            {(event.topics_covered?.length || event.who_should_attend?.length || event.prerequisites) && (
              <section
                id="topics"
                className="scroll-mt-28 bg-orbit-card border border-orbit-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
              >
                <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orbit-highlight" />
                  <span>Curriculum & Audience</span>
                </h2>

                {/* Topics Covered */}
                {event.topics_covered && event.topics_covered.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-orbit-text font-bold">
                      Topics & Technologies Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {event.topics_covered.map((topic) => (
                        <span
                          key={topic}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-mono bg-orbit-surface text-orbit-signal border border-orbit-border hover:border-orbit-signal/40 transition-colors"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Who Should Attend */}
                {event.who_should_attend && event.who_should_attend.length > 0 && (
                  <div className="pt-4 border-t border-orbit-border/80 space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-orbit-text font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-orbit-secondary" />
                      <span>Target Audience</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {event.who_should_attend.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-orbit-surface/60 border border-orbit-border/60 text-xs text-orbit-text"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {event.prerequisites && (
                  <div className="pt-4 border-t border-orbit-border/80 text-xs text-orbit-muted space-y-1">
                    <span className="font-mono uppercase font-bold text-orbit-text block">
                      Prerequisites & Preparation
                    </span>
                    <p className="leading-relaxed bg-orbit-surface/40 p-3 rounded-xl border border-orbit-border/60">
                      {event.prerequisites}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* 3.4 Schedule / Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <section
                id="schedule"
                className="scroll-mt-28 bg-orbit-card border border-orbit-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4"
              >
                <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orbit-sunset" />
                  <span>Official Event Schedule</span>
                </h2>
                <div className="divide-y divide-orbit-border/60">
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-4 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 text-xs"
                    >
                      <span className="font-mono text-orbit-signal font-bold shrink-0 min-w-[100px] px-2.5 py-1 rounded-lg bg-orbit-surface border border-orbit-border inline-block text-center sm:text-left">
                        {item.time}
                      </span>
                      <div className="space-y-1">
                        <strong className="text-orbit-text font-semibold block text-sm">
                          {item.title}
                        </strong>
                        {item.speaker && (
                          <span className="text-orbit-muted block text-xs">
                            Speaker: <strong className="text-orbit-highlight">{item.speaker}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3.5 Verified Perks & Evidence Matrix */}
            <section
              id="perks"
              className="scroll-mt-28 bg-orbit-card border border-orbit-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audited Perks Standard</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                  Verified Benefits & Perks Breakdown
                </h2>
                <p className="text-xs text-orbit-muted mt-1 font-sans">
                  We verify each perk independently. We never promise food, goodies, certificates, or admission without reliable host evidence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Goodies */}
                <div className="p-4 rounded-2xl bg-orbit-surface/70 border border-orbit-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-orbit-subtle uppercase">Free Goodies</span>
                    <Gift className="w-4 h-4 text-orbit-pink" />
                  </div>
                  <GoodiesBadge status={event.goodies_status} />
                  <p className="text-xs text-orbit-muted leading-relaxed pt-1">
                    {event.goodies_details || "No explicit free goodies promised for this meetup."}
                  </p>
                </div>

                {/* Certificate */}
                <div className="p-4 rounded-2xl bg-orbit-surface/70 border border-orbit-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-orbit-subtle uppercase">Certificate</span>
                    <Award className="w-4 h-4 text-orbit-signal" />
                  </div>
                  <CertificateBadge status={event.certificate_status} />
                  <p className="text-xs text-orbit-muted leading-relaxed pt-1">
                    {event.certificate_requirements || "Attendance certificates are not provided for this session."}
                  </p>
                  {event.certificate_format && event.certificate_format !== "none" && (
                    <div className="text-[10px] font-mono text-orbit-subtle uppercase mt-1">
                      Format: {event.certificate_format}
                    </div>
                  )}
                </div>

                {/* Food */}
                <div className="p-4 rounded-2xl bg-orbit-surface/70 border border-orbit-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-orbit-subtle uppercase">Food / Drinks</span>
                    <Coffee className="w-4 h-4 text-emerald-400" />
                  </div>
                  <FoodBadge status={event.food_status} />
                  <p className="text-xs text-orbit-muted leading-relaxed pt-1">
                    {event.food_details || "Refreshments are unverified or self-sponsored at the venue cafe."}
                  </p>
                </div>
              </div>
            </section>

            {/* 3.6 Venue & Transit Section */}
            <section
              id="venue"
              className="scroll-mt-28 bg-orbit-card border border-orbit-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orbit-sunset" />
                  <span>Venue, Location & Transit</span>
                </h2>
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-orbit-surface text-orbit-signal border border-orbit-border">
                  {event.area}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3 text-xs text-orbit-muted">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-orbit-subtle block mb-1">
                      Physical Venue
                    </span>
                    <strong className="text-base font-display font-bold text-white block">
                      {event.venue}
                    </strong>
                    {event.address && (
                      <p className="mt-1 leading-relaxed text-orbit-muted">{event.address}</p>
                    )}
                  </div>

                  {event.landmark && (
                    <div className="p-3 rounded-xl bg-orbit-surface/50 border border-orbit-border/60">
                      <span className="text-[10px] font-mono text-orbit-subtle uppercase block">
                        Landmark
                      </span>
                      <span className="text-orbit-text font-medium">{event.landmark}</span>
                    </div>
                  )}

                  {event.metro_station && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-orbit-surface border border-orbit-border text-orbit-secondary">
                      <Train className="w-4 h-4 shrink-0 mt-0.5 text-orbit-signal" />
                      <div>
                        <span className="text-[10px] font-mono uppercase text-orbit-subtle block">
                          Nearest Namma Metro
                        </span>
                        <span className="font-semibold text-orbit-text">{event.metro_station}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Action Card */}
                <div className="p-5 rounded-2xl bg-orbit-surface/60 border border-orbit-border space-y-4">
                  <div className="space-y-1">
                    <strong className="text-sm font-semibold text-white block">
                      Need directions?
                    </strong>
                    <p className="text-xs text-orbit-muted">
                      Open location directly in Google Maps for turn-by-turn navigation across Bengaluru traffic.
                    </p>
                  </div>

                  <a
                    href={
                      event.map_url ||
                      `https://maps.google.com/?q=${encodeURIComponent(
                        `${event.venue}, ${event.area}, Bengaluru`
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono font-bold bg-orbit-card hover:bg-orbit-cardHover text-orbit-text border border-orbit-border hover:border-orbit-signal/50 transition-all shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-orbit-signal" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto text-orbit-subtle" />
                  </a>
                </div>
              </div>
            </section>

            {/* 3.7 Verification Audit Trail */}
            <section
              id="audit"
              className="scroll-mt-28 bg-orbit-card/60 border border-orbit-border rounded-3xl p-6 sm:p-8 text-xs text-orbit-muted space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Independent Verification Audit Trail</span>
                </span>
                <span className="font-mono text-[11px] text-orbit-subtle">
                  Last verified: {formatRelativeTime(event.last_verified_at)}
                </span>
              </div>

              {event.verification_notes && (
                <p className="text-xs text-orbit-muted leading-relaxed bg-orbit-surface/40 p-3.5 rounded-xl border border-orbit-border/60 font-sans">
                  <strong className="text-orbit-text font-mono">Audit Notes:</strong> {event.verification_notes}
                </p>
              )}

              {event.source_urls && event.source_urls.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-orbit-subtle block">
                    Verified Direct Organiser Sources:
                  </span>
                  <div className="space-y-1.5">
                    {event.source_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orbit-signal hover:underline flex items-center gap-1.5 font-mono text-[11px] truncate max-w-xl"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Right Column: District Sticky Action Rail                    */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-6">
            <EventDetailsActions event={event} />
          </div>
        </div>
      </div>
    </>
  );
}
