import type { OrbitEvent, EventFilters } from "../types/event.ts";
import { isHackathonEvent } from "./hackathons.ts";

export const TYPES = [{ value: "all", label: "All" }, { value: "events", label: "Events" }, { value: "hackathons", label: "Hackathons" }] as const;
export const PRICES = [{ value: "all", label: "All prices" }, { value: "free", label: "Free" }, { value: "paid", label: "Paid" }] as const;
export const DATES = [{ value: "all", label: "Any day" }, { value: "today", label: "Today" }, { value: "weekend", label: "Weekend" }, { value: "weekday", label: "Weekday" }, { value: "next_7_days", label: "Next 7 days" }] as const;
export type AdvancedFilters = { type: typeof TYPES[number]["value"]; price: typeof PRICES[number]["value"]; dateFilter: typeof DATES[number]["value"] };
export const DEFAULT_ADVANCED: AdvancedFilters = { type: "all", price: "all", dateFilter: "all" };
export const POPULAR_CITIES = ["Bengaluru", "Hyderabad", "Mumbai", "Delhi NCR", "Chennai", "Pune"];
const CITY_ALIASES: Record<string, string[]> = {
  Bengaluru: ["bengaluru", "bangalore"], Hyderabad: ["hyderabad"], Mumbai: ["mumbai", "bombay"],
  "Delhi NCR": ["delhi", "new delhi", "delhi ncr", "noida", "gurugram", "gurgaon", "faridabad", "ghaziabad"],
  Chennai: ["chennai", "madras"], Pune: ["pune"], Kolkata: ["kolkata"], Ahmedabad: ["ahmedabad"],
  Kochi: ["kochi", "cochin"], Jaipur: ["jaipur"], Chandigarh: ["chandigarh"], Indore: ["indore"],
};
export function normalizeCity(value: string): string {
  const clean = value.trim();
  return Object.entries(CITY_ALIASES).find(([, aliases]) => aliases.includes(clean.toLowerCase()))?.[0] || clean;
}
export function eventCity(event: Partial<OrbitEvent>): string | null {
  if (event.city?.trim()) return normalizeCity(event.city);
  // Legacy fallback is evidence in the location fields, never an assumed home city.
  const location = [event.address, event.venue, event.area].filter(Boolean).join(" ").toLowerCase();
  return Object.entries(CITY_ALIASES).find(([, aliases]) => aliases.some(alias => new RegExp(`\\b${alias}\\b`, "i").test(location)))?.[0] || null;
}
export function eventFormat(event: Partial<OrbitEvent>): "in_person" | "online" | "hybrid" {
  return event.event_format || (event.is_in_person ? "in_person" : "online");
}
export function locationLabel(event: Partial<OrbitEvent>): string {
  const format = eventFormat(event);
  if (format === "online") return "Online";
  return `${eventCity(event) || "City not confirmed"} · ${format === "hybrid" ? "Hybrid" : "In person"}`;
}
export function priceStatus(event: Partial<OrbitEvent>): "free" | "paid" | "unknown" {
  if ((event.price_status === "free" || !event.price_status && event.is_free) && (event.fee_amount || 0) > 0) return "unknown";
  if (event.price_status) return event.price_status;
  // Legacy published records have an independently verified admission boolean.
  if (!event.last_verified_at) return "unknown";
  return event.is_free === true ? "free" : event.is_free === false ? "paid" : "unknown";
}
export function verifiedFee(event: Partial<OrbitEvent>): number | null {
  if (priceStatus(event) === "free") return 0;
  return priceStatus(event) === "paid" && event.fee_source_url && event.fee_verified_at &&
    typeof event.fee_amount === "number" && Number.isFinite(event.fee_amount) && event.fee_amount > 0 &&
    /^[A-Z]{3}$/.test(event.fee_currency || "") ? event.fee_amount : null;
}
export function priceLabel(event: Partial<OrbitEvent>): string {
  if (priceStatus(event) === "free") return "Free";
  const fee = verifiedFee(event);
  if (fee === null) return "Price not confirmed";
  try { return `${event.fee_is_from ? "From " : ""}${new Intl.NumberFormat("en-IN", { style: "currency", currency: event.fee_currency!, maximumFractionDigits: 2 }).format(fee)}`; }
  catch { return "Price not confirmed"; }
}
const DAY = 86_400_000;
const IST = 19_800_000;
export function istDay(timestamp: number): number { return Math.floor((timestamp + IST) / DAY); }
export function matchesDate(event: Pick<OrbitEvent, "start_at" | "end_at">, preset: EventFilters["dateFilter"], now = Date.now(), customDate?: string): boolean {
  if (!preset || preset === "all") return true;
  const start = Date.parse(event.start_at), end = Date.parse(event.end_at);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= now || end < start) return false;
  const today = istDay(now), first = istDay(Math.max(start, now)), last = istDay(Math.max(start, end - 1));
  const overlaps = (a: number, b: number) => first <= b && last >= a;
  if (preset === "today") return overlaps(today, today);
  if (preset === "tomorrow") return overlaps(today + 1, today + 1);
  if (preset === "next_7_days") return overlaps(today, today + 6);
  if (preset === "custom") { const day = istDay(Date.parse(`${customDate}T00:00:00+05:30`)); return overlaps(day, day); }
  if (preset === "this_month") {
    const d = new Date(now + IST);
    return overlaps(istDay(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) - IST), istDay(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1) - IST) - 1);
  }
  // At most seven iterations, even for a multi-month event.
  for (let day = first; day <= Math.min(last, first + 6); day++) {
    const weekday = new Date(day * DAY).getUTCDay();
    if (preset === "weekend" ? weekday === 0 || weekday === 6 : weekday >= 1 && weekday <= 5) return true;
  }
  return false;
}
export function filterDiscovery(events: OrbitEvent[], filters: EventFilters, now = Date.now()): OrbitEvent[] {
  const words = filters.search?.toLowerCase().trim().split(/\s+/).filter(Boolean) || [];
  return events.filter(event => {
    if (event.publication_status !== "published" || !Number.isFinite(Date.parse(event.start_at)) || !Number.isFinite(Date.parse(event.end_at)) || Date.parse(event.end_at) <= now) return false;
    const hack = isHackathonEvent(event);
    if (filters.type === "events" && hack || filters.type === "hackathons" && !hack) return false;
    if (filters.price && filters.price !== "all" && priceStatus(event) !== filters.price) return false;
    const city = filters.city?.trim();
    if (city && city.toLowerCase() !== "all" && city.toLowerCase() !== "all india") {
      if (city.toLowerCase() === "online") { if (eventFormat(event) === "in_person") return false; }
      else if (eventCity(event)?.toLowerCase() !== normalizeCity(city).toLowerCase()) return false;
    }
    const searchable = [event.name, event.description, event.organizer, event.venue, event.area, event.address, eventCity(event), event.state, event.category, locationLabel(event), ...(event.topics_covered || [])].join(" ").toLowerCase();
    return words.every(word => searchable.includes(word)) && matchesDate(event, filters.dateFilter, now, filters.customDate);
  }).sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at));
}
export function readDiscoveryParams(params: URLSearchParams): EventFilters & AdvancedFilters {
  const type = params.get("type"), price = params.get("price"), date = params.get("when") || params.get("date");
  return { search: params.get("q") || "", city: params.get("city") || "all",
    type: TYPES.some(o => o.value === type) ? type as AdvancedFilters["type"] : params.get("category")?.toLowerCase() === "hackathons" ? "hackathons" : "all",
    price: PRICES.some(o => o.value === price) ? price as AdvancedFilters["price"] : "all",
    dateFilter: DATES.some(o => o.value === date) ? date as AdvancedFilters["dateFilter"] : "all" };
}
