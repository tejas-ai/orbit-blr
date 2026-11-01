"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Bookmark, CalendarDays, MapPin, Code2, Cpu } from "lucide-react";
import type { OrbitEvent } from "@/types/event";
import { isHackathonEvent } from "@/lib/hackathons";
import { eventFormat, locationLabel, priceLabel, priceStatus } from "@/lib/discovery";

interface EventCardProps {
  event: OrbitEvent; isSaved?: boolean; onToggleSave?: (id: string) => void;
  priority?: boolean; variant?: "standard" | "compact" | "featured";
}
const statusLabels: Record<string,string> = { open: "Registration open", approval_required: "Host approval required", waitlist: "Waitlist", full: "Full", closed: "Registration closed", not_yet_open: "Registration opens soon" };
export default function EventCard({ event, isSaved = false, onToggleSave, priority = false }: EventCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const hack = isHackathonEvent(event);
  const officialImage = event.thumbnail_verification_status === "verified" && event.thumbnail_url && !imageFailed;
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", weekday: "short", timeZone: "Asia/Kolkata" });
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const start = new Date(event.start_at), end = new Date(event.end_at);
  const multiDay = date.format(start) !== date.format(end);
  const category = hack ? "Hackathons" : event.category.toLowerCase() === "ai" ? "AI & ML" : event.category.charAt(0).toUpperCase() + event.category.slice(1);
  return <article data-testid="event-card" className="event-discovery-card">
    <Link href={`/events/${event.slug}`} className="event-card-art" tabIndex={-1} aria-hidden="true" prefetch={false}>
      {officialImage ? <Image src={event.thumbnail_url!} alt="" width={640} height={360} loading={priority ? "eager" : "lazy"} unoptimized onError={() => setImageFailed(true)} /> :
        <div className="category-art" data-hack={hack}><span className="category-art-label">ORBIT BLR / {hack ? "BUILD TOGETHER" : "EXPLORE & CONNECT"}</span><div className="category-art-bottom"><strong>{category}</strong>{hack ? <Code2 size={44} strokeWidth={1} /> : <Cpu size={44} strokeWidth={1} />}</div><span className="category-art-label">Category illustration</span></div>}
    </Link>
    <div className="event-card-content">
      <div className="event-card-top"><span className="event-kind">{hack ? "Hackathon" : "Event"}{!hack && ` / ${category}`}</span>{onToggleSave && <button type="button" className="icon-button" aria-pressed={isSaved} aria-label={`${isSaved ? "Unsave" : "Save"} ${event.name}`} onClick={() => onToggleSave(event.id)}><Bookmark size={18} fill={isSaved ? "currentColor" : "none"} /></button>}</div>
      <h3 className="event-card-title"><Link href={`/events/${event.slug}`} prefetch={false}>{event.name}</Link></h3>
      <p className="event-organizer">{event.organizer}</p>
      <div className="event-card-facts"><p><CalendarDays size={15} /><span><time dateTime={event.start_at}>{date.format(start)}{multiDay ? ` – ${date.format(end)}` : ""}</time><br />{time.format(start)} IST</span></p>
        <p><MapPin size={15} /><span>{locationLabel(event)}{eventFormat(event) !== "online" && <><br />{event.venue}</>}</span></p></div>
      {event.last_verified_at && <p className="event-status">{statusLabels[event.registration_status] || "Check registration with organiser"}<time dateTime={event.last_verified_at}>Checked {new Date(event.last_verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}</time></p>}
      <div className="event-card-footer"><div><p className="event-price">{priceLabel(event)}<small>{hack ? "Participation fee" : priceStatus(event) === "free" ? "Admission" : "Ticket price"}</small></p><Link href={`/events/${event.slug}`} className="event-details-link" prefetch={false}>View Details <ArrowUpRight size={16} /></Link></div></div>
      {officialImage && event.thumbnail_attribution && <p className="image-attribution">Image: {event.thumbnail_attribution}</p>}
    </div>
  </article>;
}
