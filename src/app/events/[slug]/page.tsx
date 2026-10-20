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
      url: `https://orbitblr.in/events/${event.slug}`,
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
    ...(hackathon.isHackathon ? [{ id: "hackathon", label: "Hackathon Rules" }] : []),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-32 lg:pb-16 bg-white min-h-screen">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#6A38EB] transition-colors flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link href="/explore" className="hover:text-[#6A38EB] transition-colors shrink-0">
            Explore Events
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md font-semibold">
            {event.name}
          </span>
        </nav>

        {/* 1. DISTRICT HERO MEDIA BANNER */}
        <EventHeroBanner
          event={event}
          initialSrc={thumbnailData.src}
          alt={thumbnailData.alt}
          displayCategory={displayCategory}
          isHack={isHack}
        />

        {/* 2. SECTION NAVIGATION BAR */}
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md py-2 border-y border-slate-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full">
            {navSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap"
              >
                {sec.label}
              </a>
            ))}
          </div>
        </div>

        {/* 3. TWO-COLUMN EDITORIAL CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Event Details & Specifications */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {/* 3.1 Overview */}
            <section
              id="overview"
              className="scroll-mt-28 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
            >
              <h2 className="text-xl font-extrabold text-slate-950 tracking-tight font-serif flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6A38EB]" />
                <span>About This Event</span>
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed space-y-3 font-normal whitespace-pre-line font-sans">
                {event.description}
              </div>

              {/* Host Admission Protocol Disclaimer */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Official Admission Protocol</span>
                </div>
                <p className="leading-relaxed">
                  Registration happens directly on the verified organiser&apos;s website. An RSVP or application does not guarantee physical entry unless the host confirms your ticket or approval email. ORBIT BLR does not issue tickets or charge fees.
                </p>
              </div>
            </section>

            {/* 3.2 Hackathon Specific Specifications (If Hackathon) */}
            {hackathon.isHackathon && (
              <section
                id="hackathon"
                className="scroll-mt-28 bg-gradient-to-r from-amber-50/70 via-white to-purple-50/30 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
              >
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight font-serif">
                    Hackathon Specifications &amp; Rules
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hackathon.teamSize && (
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 font-bold block">
                        Team Formation
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 font-bold">
                        <Users className="w-4 h-4 text-amber-600" />
                        <span>{hackathon.teamSize}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.registrationDeadline && (
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 font-bold block">
                        Application Deadline
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 font-bold">
                        <Timer className="w-4 h-4 text-amber-600" />
                        <span>{hackathon.registrationDeadline}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.duration && (
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 font-bold block">
                        Sprint Duration
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{hackathon.duration}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.eligibility && (
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-200/80 space-y-1 sm:col-span-2 lg:col-span-3 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 font-bold block">
                        Eligibility &amp; Participant Criteria
                      </span>
                      <strong className="text-xs text-slate-900 flex items-center gap-1.5 font-medium">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
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
                className="scroll-mt-28 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
              >
                <h2 className="text-xl font-extrabold text-slate-950 tracking-tight font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#6A38EB]" />
                  <span>Curriculum &amp; Audience</span>
                </h2>

                {event.topics_covered && event.topics_covered.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 font-bold">
                      Topics &amp; Technologies Covered
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {event.topics_covered.map((topic) => (
                        <span
                          key={topic}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#6A38EB] border border-purple-100"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.who_should_attend && event.who_should_attend.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#6A38EB]" />
                      <span>Target Audience</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {event.who_should_attend.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.prerequisites && (
                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <span className="uppercase font-bold text-slate-900 block">
                      Prerequisites &amp; Preparation
                    </span>
                    <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      {event.prerequisites}
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* 3.4 Agenda & Schedule */}
            {event.agenda && event.agenda.length > 0 && (
              <section
                id="schedule"
                className="scroll-mt-28 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
              >
                <h2 className="text-xl font-extrabold text-slate-950 tracking-tight font-serif flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#6A38EB]" />
                  <span>Official Event Schedule</span>
                </h2>
                <div className="divide-y divide-slate-100">
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5 text-xs"
                    >
                      <span className="font-bold text-[#6A38EB] shrink-0 min-w-[90px] px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 inline-block text-center sm:text-left">
                        {item.time}
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-slate-900 font-bold block text-sm">
                          {item.title}
                        </strong>
                        {item.speaker && (
                          <span className="text-slate-500 block text-xs">
                            Speaker: <strong className="text-slate-700">{item.speaker}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3.5 Verified Perks & Evidence Breakdown */}
            <section
              id="perks"
              className="scroll-mt-28 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audited Perks Standard</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight font-serif">
                  Verified Benefits &amp; Perks Breakdown
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  We verify each perk independently. Benefits are listed strictly where confirmed by organisers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Goodies */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-bold uppercase">Free Goodies</span>
                    <Gift className="w-4 h-4 text-amber-600" />
                  </div>
                  <GoodiesBadge status={event.goodies_status} />
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {event.goodies_details || "No explicit free goodies promised for this meetup."}
                  </p>
                </div>

                {/* Certificate */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-bold uppercase">Certificate</span>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <CertificateBadge status={event.certificate_status} />
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {event.certificate_requirements || "Attendance certificates are not provided for this session."}
                  </p>
                  {event.certificate_format && event.certificate_format !== "none" && (
                    <div className="text-[10px] text-slate-500 uppercase mt-1">
                      Format: {event.certificate_format}
                    </div>
                  )}
                </div>

                {/* Food */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-bold uppercase">Food / Drinks</span>
                    <Coffee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <FoodBadge status={event.food_status} />
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {event.food_details || "Refreshments are unverified or self-sponsored at the venue cafe."}
                  </p>
                </div>
              </div>
            </section>

            {/* 3.6 Venue & Transit Section */}
            <section
              id="venue"
              className="scroll-mt-28 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-950 tracking-tight font-serif flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#6A38EB]" />
                  <span>Venue, Location &amp; Transit</span>
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6A38EB] border border-purple-100">
                  {event.area}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Physical Venue
                    </span>
                    <strong className="text-base font-extrabold text-slate-950 block font-serif">
                      {event.venue}
                    </strong>
                    {event.address && (
                      <p className="mt-1 leading-relaxed text-slate-600">{event.address}</p>
                    )}
                  </div>

                  {event.landmark && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Landmark
                      </span>
                      <span className="text-slate-800 font-semibold">{event.landmark}</span>
                    </div>
                  )}

                  {event.metro_station && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                      <Train className="w-4 h-4 shrink-0 mt-0.5 text-[#6A38EB]" />
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Nearest Namma Metro
                        </span>
                        <span className="font-bold text-slate-900">{event.metro_station}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Action Card */}
                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                  <div className="space-y-1">
                    <strong className="text-sm font-bold text-slate-900 block">
                      Need directions?
                    </strong>
                    <p className="text-xs text-slate-600">
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 transition-all shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-[#6A38EB]" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </a>
                </div>
              </div>
            </section>

            {/* 3.7 Verification Audit Trail */}
            <section
              id="audit"
              className="scroll-mt-28 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-xs text-slate-600 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-900 font-bold flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Independent Verification Audit Trail</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Last verified: {formatRelativeTime(event.last_verified_at)}
                </span>
              </div>

              {event.verification_notes && (
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  <strong className="text-slate-900">Audit Notes:</strong> {event.verification_notes}
                </p>
              )}

              {event.source_urls && event.source_urls.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 font-semibold block">
                    Verified Direct Organiser Sources:
                  </span>
                  <div className="space-y-1">
                    {event.source_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6A38EB] hover:underline flex items-center gap-1.5 text-[11px] truncate max-w-xl font-medium"
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

          {/* Right Column: District Sticky Action Rail */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <EventDetailsActions event={event} />
          </div>
        </div>
      </div>
    </>
  );
}
