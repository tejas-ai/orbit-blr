import HomeClient from "@/components/home/HomeClient";
import { getAllEvents } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Explore events across India — ORBIT BLR", description: "Find tech events, workshops and hackathons across India. Filter by city, price and date.", alternates: { canonical: "/explore" } };
export default async function ExplorePage() {
  return <HomeClient initialEvents={await getAllEvents({ includeUnpublished: false })} />;
}
