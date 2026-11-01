"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { OrbitEvent, EventFilters } from "@/types/event";
import { eventCity, filterDiscovery, readDiscoveryParams, type AdvancedFilters } from "@/lib/discovery";
import { useLiveEvents } from "@/lib/useLiveEvents";
import { useSavedEvents } from "@/lib/useSavedEvents";
import DiscoveryControls from "@/components/events/DiscoveryControls";
import EventCard from "@/components/events/EventCard";

export default function DiscoveryClient({ initialEvents }: { initialEvents: OrbitEvent[] }) {
  const params = useSearchParams();
  const [filters, setFilters] = useState<EventFilters & AdvancedFilters>(() => readDiscoveryParams(new URLSearchParams(params.toString())));
  const [now, setNow] = useState(() => Date.now());
  const events = useLiveEvents(initialEvents);
  const { isSaved, toggleSave } = useSavedEvents();
  useEffect(() => {
    const next = readDiscoveryParams(new URLSearchParams(params.toString()));
    if (!params.has("city")) { try { next.city = localStorage.getItem("orbit_discovery_city") || "all"; } catch { /* Storage is optional. */ } }
    setFilters(next);
  }, [params]);
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(id); }, []);
  const update = (partial: Partial<EventFilters & AdvancedFilters>) => {
    const next = { ...filters, ...partial };
    setFilters(next);
    const url = new URL(window.location.href);
    for (const key of ["q", "city", "type", "price", "when", "date", "category"]) url.searchParams.delete(key);
    if (next.search) url.searchParams.set("q", next.search);
    url.searchParams.set("city", next.city || "all");
    if (next.type !== "all") url.searchParams.set("type", next.type);
    if (next.price !== "all") url.searchParams.set("price", next.price);
    if (next.dateFilter !== "all") url.searchParams.set("when", next.dateFilter);
    window.history.replaceState(null, "", url);
    if (partial.city) { try { localStorage.setItem("orbit_discovery_city", partial.city); } catch { /* Storage is optional. */ } }
  };
  const cities = useMemo(() => events.map(eventCity).filter((c): c is string => Boolean(c)), [events]);
  const visible = useMemo(() => filterDiscovery(events, filters, now), [events, filters, now]);
  return <div className="discovery-page">
    <section className="discovery-intro" aria-labelledby="discovery-title"><p className="discovery-eyebrow"><span /> YOUR NEXT CONNECTION STARTS HERE</p>
      <h1 id="discovery-title">Discover Events <span>&amp; Hackathons</span></h1><p className="discovery-subtitle">Find what&apos;s happening across India.</p>
    </section>
    <DiscoveryControls search={filters.search || ""} city={filters.city || "all"} advanced={{ type: filters.type, price: filters.price, dateFilter: filters.dateFilter }} cities={cities}
      onSearch={search => update({ search })} onCity={city => update({ city })} onAdvanced={advanced => update(advanced)} />
    <section className="discovery-results" aria-labelledby="results-heading">
      <div className="results-heading"><h2 id="results-heading">Coming up <span aria-live="polite" aria-atomic="true">{visible.length} {visible.length === 1 ? "event" : "events"}</span></h2><span>Soonest first <span aria-hidden="true">↗</span></span></div>
      {visible.length > 0 ? <div className="discovery-grid">{visible.map((event, i) => <EventCard key={event.id} event={event} priority={i < 3} isSaved={isSaved(event.id)} onToggleSave={toggleSave} />)}</div> :
        <div className="discovery-empty"><Search size={28} /><h3>No events match just yet</h3><p>Try another city, a different search, or fewer filters.</p><p>New listings appear after source checks.</p></div>}
    </section>
    <div className="discovery-footnote"><p><ShieldCheck size={17} /> Source-checked listings. Register with the organiser.</p><Link href="/suggest">Know an event? <ArrowUpRight size={16} /></Link></div>
  </div>;
}
