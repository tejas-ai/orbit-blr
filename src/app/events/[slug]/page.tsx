import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getEventBySlug } from "@/lib/db";
import { getEventThumbnail, getEventSocialImage } from "@/lib/thumbnails";
import { SITE_URL, SITE_NAME } from "@/lib/site";
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

  if (!event || event.publication_status !== "published") {
    return {
      title: "Event Not Found — ORBIT BLR",
      robots: { index: false, follow: false },
    };
  }

  const socialImage = getEventSocialImage(event, SITE_URL);
  const cleanDescription =
    event.description.length > 155
      ? `${event.description.slice(0, 152).trim()}...`
      : event.description;

  const eventUrl = `${SITE_URL}/events/${event.slug}`;

  return {
    title: `${event.name} — Free Tech Event in Bengaluru | ORBIT BLR`,
    description: cleanDescription,
    alternates: {
      canonical: eventUrl,
    },
    openGraph: {
      title: `${event.name} — Free Tech Event in Bengaluru`,
      description: cleanDescription,
      url: eventUrl,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: socialImage.url,
          width: 1200,
          height: 630,
          alt: socialImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.name} — ORBIT BLR`,
      description: cleanDescription,
      images: [socialImage.url],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || event.publication_status !== "published") {
    notFound();
  }

  const thumbnailData = getEventThumbnail(event);
  const socialImage = getEventSocialImage(event, SITE_URL);
  const isHack = isHackathonEvent(event);
  const hackathon = extractHackathonDetails(event);
  const displayCategory = isHack ? "Hackathons" : event.category;

  const eventUrl = `${SITE_URL}/events/${event.slug}`;

  // Build verified Schema.org Offer object
  const offersObj: Record<string, any> = {
    "@type": "Offer",
    url: event.registration_url,
    price: "0",
    priceCurrency: "INR",
    validFrom: event.created_at,
  };

  // Only assign supported, verified availability values; omit when uncertain
  // (e.g. waitlist or approval_required do not map cleanly to InStock/SoldOut)
  if (event.registration_status === "open") {
    offersObj.availability = "https://schema.org/InStock";
  } else if (event.registration_status === "closed") {
    offersObj.availability = "https://schema.org/SoldOut";
  }

  // Schema.org Event Structured Data strictly using verified database fields
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    url: eventUrl,
    description: event.description,
    startDate: event.start_at,
    endDate: event.end_at,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.is_in_person
      ? "https://schema.org/OfflineEventAttendanceMode"
      : "https://schema.org/OnlineEventAttendanceMode",
    isAccessibleForFree: true,
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
    image: [socialImage.url],
    offers: offersObj,
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-32 lg:pb-16 bg-white dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] min-h-screen transition-colors duration-300">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#CBD5E1] font-medium">
          <Link href="/" className="hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors flex items-center gap-1 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-[#302B43] shrink-0" />
          <Link href={isHack ? "/hackathons" : "/explore"} className="hover:text-[#6A38EB] dark:hover:text-[#A78BFA] transition-colors shrink-0">
             {isHack ? "Hackathons" : "Explore Events"}
           </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-[#302B43] shrink-0" />
          <span className="text-slate-900 dark:text-[#F7F5FF] truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs md:max-w-md font-semibold">
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
        <div className="sticky top-14 z-30 bg-white/95 dark:bg-[#0E0E16]/95 backdrop-blur-md py-2 border-y border-slate-200 dark:border-[#302B43] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 overflow-hidden transition-colors">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full">
            {navSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:text-slate-900 dark:hover:text-[#F7F5FF] hover:bg-slate-100 dark:hover:bg-[#151522] transition-all whitespace-nowrap"
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
              className="scroll-mt-28 bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4 transition-colors"
            >
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6A38EB] dark:text-[#A78BFA]" />
                <span>About This Event</span>
              </h2>
              <div className="text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed space-y-3 font-normal whitespace-pre-line font-sans">
                {event.description}
              </div>

              {/* Host Admission Protocol Disclaimer */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#151522] border border-slate-200/80 dark:border-[#302B43] text-xs text-slate-600 dark:text-[#CBD5E1] space-y-1">
                <div className="flex items-center gap-2 text-slate-900 dark:text-[#F7F5FF] font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                className="scroll-mt-28 bg-gradient-to-r from-amber-50/70 via-white to-purple-50/30 dark:from-[#2A1D0D] dark:via-[#1D1B2C] dark:to-[#171424] border border-amber-200 dark:border-amber-900/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-colors"
              >
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
                    Hackathon Specifications &amp; Rules
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {hackathon.teamSize && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151522] border border-amber-200/80 dark:border-amber-900/40 space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 dark:text-amber-400 font-bold block">
                        Team Formation
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-[#F7F5FF] flex items-center gap-1.5 font-bold">
                        <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{hackathon.teamSize}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.registrationDeadline && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151522] border border-amber-200/80 dark:border-amber-900/40 space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 dark:text-amber-400 font-bold block">
                        Application Deadline
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-[#F7F5FF] flex items-center gap-1.5 font-bold">
                        <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{hackathon.registrationDeadline}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.duration && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151522] border border-amber-200/80 dark:border-amber-900/40 space-y-1 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 dark:text-amber-400 font-bold block">
                        Sprint Duration
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-[#F7F5FF] flex items-center gap-1.5 font-bold">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{hackathon.duration}</span>
                      </strong>
                    </div>
                  )}

                  {hackathon.eligibility && (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#151522] border border-amber-200/80 dark:border-amber-900/40 space-y-1 sm:col-span-2 lg:col-span-3 shadow-sm">
                      <span className="text-[10px] uppercase text-amber-900 dark:text-amber-400 font-bold block">
                        Eligibility &amp; Participant Criteria
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-[#F7F5FF] flex items-center gap-1.5 font-medium">
                        <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
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
                className="scroll-mt-28 bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-5 transition-colors"
              >
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#6A38EB] dark:text-[#A78BFA]" />
                  <span>Curriculum &amp; Audience</span>
                </h2>

                {event.topics_covered && event.topics_covered.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-[#F7F5FF] font-bold">
                      Topics &amp; Technologies Covered
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {event.topics_covered.map((topic) => (
                        <span
                          key={topic}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-[#151522] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-100 dark:border-[#302B43]"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.who_should_attend && event.who_should_attend.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-[#302B43] space-y-2.5">
                    <h3 className="text-xs uppercase tracking-wider text-slate-900 dark:text-[#F7F5FF] font-bold flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
                      <span>Target Audience</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {event.who_should_attend.map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200/70 dark:border-[#302B43] text-xs text-slate-700 dark:text-[#CBD5E1] font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {event.prerequisites && (
                  <div className="pt-4 border-t border-slate-100 dark:border-[#302B43] text-xs text-slate-600 dark:text-[#CBD5E1] space-y-1">
                    <span className="uppercase font-bold text-slate-900 dark:text-[#F7F5FF] block">
                      Prerequisites &amp; Preparation
                    </span>
                    <p className="leading-relaxed bg-slate-50 dark:bg-[#151522] p-3 rounded-xl border border-slate-200/70 dark:border-[#302B43]">
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
                className="scroll-mt-28 bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4 transition-colors"
              >
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#6A38EB] dark:text-[#A78BFA]" />
                  <span>Official Event Schedule</span>
                </h2>
                <div className="divide-y divide-slate-100 dark:divide-[#302B43]">
                  {event.agenda.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5 text-xs"
                    >
                      <span className="font-bold text-[#6A38EB] dark:text-[#A78BFA] shrink-0 min-w-[90px] px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-[#151522] border border-purple-100 dark:border-[#302B43] inline-block text-center sm:text-left">
                        {item.time}
                      </span>
                      <div className="space-y-0.5">
                        <strong className="text-slate-900 dark:text-[#F7F5FF] font-bold block text-sm">
                          {item.title}
                        </strong>
                        {item.speaker && (
                          <span className="text-slate-500 dark:text-[#CBD5E1] block text-xs">
                            Speaker: <strong className="text-slate-700 dark:text-[#F7F5FF]">{item.speaker}</strong>
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
              className="scroll-mt-28 bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-5 transition-colors"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audited Perks Standard</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
                  Verified Benefits &amp; Perks Breakdown
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1 font-sans">
                  We verify each perk independently. Benefits are listed strictly where confirmed by organisers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Goodies */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151522] border border-slate-200/80 dark:border-[#302B43] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-[#CBD5E1] font-bold uppercase">Free Goodies</span>
                    <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <GoodiesBadge status={event.goodies_status} />
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed pt-1">
                    {event.goodies_details || "No explicit free goodies promised for this meetup."}
                  </p>
                </div>

                {/* Certificate */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151522] border border-slate-200/80 dark:border-[#302B43] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-[#CBD5E1] font-bold uppercase">Certificate</span>
                    <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CertificateBadge status={event.certificate_status} />
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed pt-1">
                    {event.certificate_requirements || "Attendance certificates are not provided for this session."}
                  </p>
                  {event.certificate_format && event.certificate_format !== "none" && (
                    <div className="text-[10px] text-slate-500 dark:text-[#CBD5E1] uppercase mt-1">
                      Format: {event.certificate_format}
                    </div>
                  )}
                </div>

                {/* Food */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151522] border border-slate-200/80 dark:border-[#302B43] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-[#CBD5E1] font-bold uppercase">Food / Drinks</span>
                    <Coffee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <FoodBadge status={event.food_status} />
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed pt-1">
                    {event.food_details || "Refreshments are unverified or self-sponsored at the venue cafe."}
                  </p>
                </div>
              </div>
            </section>

            {/* 3.6 Venue & Transit Section */}
            <section
              id="venue"
              className="scroll-mt-28 bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#6A38EB] dark:text-[#A78BFA]" />
                  <span>Venue, Location &amp; Transit</span>
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-[#151522] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-100 dark:border-[#302B43]">
                  {event.area}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="space-y-3 text-xs text-slate-600 dark:text-[#CBD5E1]">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 dark:text-[#CBD5E1]/70 font-bold block mb-1">
                      Physical Venue
                    </span>
                    <strong className="text-base font-extrabold text-slate-950 dark:text-[#F7F5FF] block font-serif">
                      {event.venue}
                    </strong>
                    {event.address && (
                      <p className="mt-1 leading-relaxed text-slate-600 dark:text-[#CBD5E1]">{event.address}</p>
                    )}
                  </div>

                  {event.landmark && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200/70 dark:border-[#302B43]">
                      <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1]/70 uppercase font-bold block">
                        Landmark
                      </span>
                      <span className="text-slate-800 dark:text-[#F7F5FF] font-semibold">{event.landmark}</span>
                    </div>
                  )}

                  {event.metro_station && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200/70 dark:border-[#302B43] text-slate-700 dark:text-[#CBD5E1]">
                      <Train className="w-4 h-4 shrink-0 mt-0.5 text-[#6A38EB] dark:text-[#A78BFA]" />
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-[#CBD5E1]/70 uppercase font-bold block">
                          Nearest Namma Metro
                        </span>
                        <span className="font-bold text-slate-900 dark:text-[#F7F5FF]">{event.metro_station}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Maps Action Card */}
                <div className="p-5 rounded-2xl bg-purple-50/40 dark:bg-[#151522] border border-purple-100 dark:border-[#302B43] space-y-3">
                  <div className="space-y-1">
                    <strong className="text-sm font-bold text-slate-900 dark:text-[#F7F5FF] block">
                      Need directions?
                    </strong>
                    <p className="text-xs text-slate-600 dark:text-[#CBD5E1]">
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
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1D1B2C] hover:bg-slate-50 dark:hover:bg-[#26233A] text-slate-900 dark:text-[#F7F5FF] border border-slate-200 dark:border-[#302B43] transition-all shadow-sm"
                  >
                    <Navigation className="w-4 h-4 text-[#6A38EB] dark:text-[#A78BFA]" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </a>
                </div>
              </div>
            </section>

            {/* 3.7 Verification Audit Trail */}
            <section
              id="audit"
              className="scroll-mt-28 bg-slate-50 dark:bg-[#1D1B2C] border border-slate-200/80 dark:border-[#302B43] rounded-3xl p-6 sm:p-8 text-xs text-slate-600 dark:text-[#CBD5E1] space-y-4 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs uppercase tracking-wider text-slate-900 dark:text-[#F7F5FF] font-bold flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Independent Verification Audit Trail</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1]">
                  Last verified: {formatRelativeTime(event.last_verified_at)}
                </span>
              </div>

              {event.verification_notes && (
                <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed bg-white dark:bg-[#151522] p-3.5 rounded-xl border border-slate-200 dark:border-[#302B43]">
                  <strong className="text-slate-900 dark:text-[#F7F5FF]">Audit Notes:</strong> {event.verification_notes}
                </p>
              )}

              {event.source_urls && event.source_urls.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-[#CBD5E1] font-semibold block">
                    Verified Direct Organiser Sources:
                  </span>
                  <div className="space-y-1">
                    {event.source_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6A38EB] dark:text-[#A78BFA] hover:underline flex items-center gap-1.5 text-[11px] truncate max-w-xl font-medium"
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
