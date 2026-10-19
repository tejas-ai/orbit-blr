import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getEventBySlug, getAllEvents } from "@/lib/db";
import {
  RegistrationBadge,
  GoodiesBadge,
  CertificateBadge,
  FoodBadge,
  FreeEntryPill,
} from "@/components/events/VerificationBadges";
import EventDetailsActions from "@/components/events/EventDetailsActions";
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
  Info,
  Gift,
  Award,
  Coffee,
  Users,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found — ORBIT BLR",
    };
  }

  return {
    title: `${event.name} — Free Tech Event in Bengaluru | ORBIT BLR`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: `${event.name} — Free Tech Event in Bengaluru`,
      description: event.description.slice(0, 160),
      url: `https://orbitblr.in/events/${event.slug}`,
      siteName: "ORBIT BLR",
      type: "website",
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

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

  return (
    <>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8 py-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-mono text-orbit-muted">
          <Link href="/" className="hover:text-orbit-signal transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-orbit-subtle" />
          <Link href="/explore" className="hover:text-orbit-signal transition-colors">
            Explore
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-orbit-subtle" />
          <span className="text-orbit-text truncate max-w-xs sm:max-w-md">{event.name}</span>
        </nav>

        {/* Main Event Header */}
        <div className="bg-gradient-to-b from-orbit-card to-orbit-surface border border-orbit-border rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-card">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-orbit-surface text-orbit-highlight border border-orbit-borderLight">
              {event.category}
            </span>
            <FreeEntryPill />
            <RegistrationBadge status={event.registration_status} />
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-orbit-text tracking-tight leading-tight max-w-4xl">
            {event.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-orbit-muted">
            <div className="flex items-center gap-1.5 font-medium text-orbit-text">
              <Building2 className="w-4 h-4 text-orbit-signal" />
              <span>Organised by <strong>{event.organizer}</strong></span>
            </div>
            <span className="text-orbit-subtle hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 font-mono text-orbit-subtle">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{formatRelativeTime(event.last_verified_at)}</span>
            </div>
          </div>
        </div>

        {/* Content Layout: Main Info + Sticky Action Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details, Agenda, Attendance Perks, Trust */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description */}
            <section className="bg-orbit-card border border-orbit-border rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-xl font-display font-bold text-orbit-text tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orbit-signal" />
                <span>Event Overview</span>
              </h2>
              <div className="text-sm text-orbit-muted leading-relaxed space-y-3 font-normal whitespace-pre-line">
                {event.description}
              </div>

              {/* Topics Covered */}
              {event.topics_covered && event.topics_covered.length > 0 && (
                <div className="pt-4 border-t border-orbit-border/80">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-orbit-text font-bold mb-3">
                    Key Topics & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.topics_covered.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 rounded-xl text-xs font-mono bg-orbit-surface text-orbit-highlight border border-orbit-border"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Who Should Attend */}
              {event.who_should_attend && event.who_should_attend.length > 0 && (
                <div className="pt-4 border-t border-orbit-border/80">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-orbit-text font-bold mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-orbit-secondary" />
                    <span>Who Should Attend</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-orbit-muted">
                    {event.who_should_attend.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orbit-signal shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {event.prerequisites && (
                <div className="pt-4 border-t border-orbit-border/80 text-xs text-orbit-muted">
                  <span className="font-mono uppercase font-bold text-orbit-text block mb-1">
                    Prerequisites & Equipment
                  </span>
                  <p>{event.prerequisites}</p>
                </div>
              )}
            </section>

            {/* Agenda Table */}
            {event.agenda && event.agenda.length > 0 && (
              <section className="bg-orbit-card border border-orbit-border rounded-2xl p-6 sm:p-8 shadow-card space-y-4">
                <h2 className="text-xl font-display font-bold text-orbit-text tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orbit-signal" />
                  <span>Schedule & Agenda</span>
                </h2>
                <div className="divide-y divide-orbit-border/80">
                  {event.agenda.map((slot, index) => (
                    <div key={index} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-orbit-signal bg-orbit-surface px-2.5 py-1 rounded-lg border border-orbit-border shrink-0">
                          {slot.time}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-orbit-text">
                          {slot.title}
                        </span>
                      </div>
                      {slot.speaker && (
                        <span className="text-[11px] font-mono text-orbit-subtle self-start sm:self-auto pl-11 sm:pl-0">
                          Speaker: <strong className="text-orbit-muted">{slot.speaker}</strong>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Attendance Perks & Verification Matrix */}
            <section className="bg-orbit-card border border-orbit-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audited Perks Standard</span>
                </div>
                <h2 className="text-xl font-display font-bold text-orbit-text tracking-tight">
                  Attendee Benefits & Evidence Breakdown
                </h2>
                <p className="text-xs text-orbit-muted mt-1">
                  We verify each perk independently. We never assume a perk is guaranteed without organizer confirmation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Goodies */}
                <div className="p-4 rounded-xl bg-orbit-surface border border-orbit-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-orbit-subtle uppercase">Free Goodies</span>
                    <Gift className="w-4 h-4 text-orbit-signal" />
                  </div>
                  <GoodiesBadge status={event.goodies_status} />
                  <p className="text-xs text-orbit-muted leading-relaxed pt-1">
                    {event.goodies_details || "No explicit free goodies promised for this meetup."}
                  </p>
                </div>

                {/* Certificate */}
                <div className="p-4 rounded-xl bg-orbit-surface border border-orbit-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-orbit-subtle uppercase">Certificate</span>
                    <Award className="w-4 h-4 text-orbit-secondary" />
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
                <div className="p-4 rounded-xl bg-orbit-surface border border-orbit-border space-y-2">
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

            {/* Verification Sources & Independent Audit */}
            <section className="bg-orbit-card/60 border border-orbit-border rounded-2xl p-6 text-xs text-orbit-muted space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-orbit-text font-bold">
                  Verification Audit Trail
                </span>
                <span className="font-mono text-[11px] text-orbit-subtle">
                  Last checked: {formatRelativeTime(event.last_verified_at)}
                </span>
              </div>
              {event.verification_notes && (
                <p className="text-xs text-orbit-muted leading-relaxed">
                  <strong>Verification Notes:</strong> {event.verification_notes}
                </p>
              )}
              {event.source_urls && event.source_urls.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono text-orbit-subtle block mb-1">
                    Verified Source Links:
                  </span>
                  <div className="space-y-1">
                    {event.source_urls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orbit-signal hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-xl"
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

          {/* Right Column: Sticky Action Card & Venue Navigation */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Quick Registration & Calendar Actions */}
            <div className="bg-orbit-card border border-orbit-border rounded-2xl p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-orbit-subtle">
                  Event Status
                </span>
                <RegistrationBadge status={event.registration_status} />
              </div>

              {/* Time and Date */}
              <div className="p-4 rounded-xl bg-orbit-surface border border-orbit-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-orbit-text font-bold">
                  <Calendar className="w-4 h-4 text-orbit-signal shrink-0" />
                  <span>{formatEventDate(event.start_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-orbit-highlight">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{formatEventTime(event.start_at, event.end_at)}</span>
                </div>
              </div>

              {/* Interactive Actions (Register, Google Cal, ICS, Save, Share) */}
              <EventDetailsActions event={event} />
            </div>

            {/* Physical Venue & Transport Info */}
            <div className="bg-orbit-card border border-orbit-border rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="font-display font-bold text-base text-orbit-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orbit-signal" />
                <span>Venue & Location</span>
              </h3>

              <div className="space-y-2 text-xs text-orbit-muted">
                <div>
                  <strong className="text-orbit-text block text-sm">{event.venue}</strong>
                  {event.address && <p className="mt-0.5 leading-relaxed">{event.address}</p>}
                </div>

                <div className="pt-2 text-[11px] font-mono text-orbit-highlight">
                  Area: <strong>{event.area}</strong>
                </div>

                {event.landmark && (
                  <div className="text-[11px] text-orbit-subtle">
                    Landmark: {event.landmark}
                  </div>
                )}

                {event.metro_station && (
                  <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-orbit-surface border border-orbit-border text-[11px] text-orbit-secondary">
                    <Train className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{event.metro_station}</span>
                  </div>
                )}
              </div>

              {/* Google Maps link */}
              <a
                href={
                  event.map_url ||
                  `https://maps.google.com/?q=${encodeURIComponent(
                    `${event.venue}, ${event.area}, Bengaluru`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium bg-orbit-surface hover:bg-orbit-border text-orbit-text border border-orbit-border transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-orbit-signal" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-auto text-orbit-subtle" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
