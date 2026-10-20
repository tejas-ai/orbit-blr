import { OrbitEvent, EventCategory } from "@/types/event";
import { isHackathonEvent } from "@/lib/hackathons";

const STATIC_CATEGORY_SVGS: Record<string, string> = {
  Hackathons: "/thumbnails/hackathons.svg",
  hackathons: "/thumbnails/hackathons.svg",
  "AI & ML": "/thumbnails/ai-ml.svg",
  "ai & ml": "/thumbnails/ai-ml.svg",
  ai: "/thumbnails/ai-ml.svg",
  Developer: "/thumbnails/developer.svg",
  developer: "/thumbnails/developer.svg",
  Cybersecurity: "/thumbnails/cybersecurity.svg",
  cybersecurity: "/thumbnails/cybersecurity.svg",
  security: "/thumbnails/cybersecurity.svg",
  Cloud: "/thumbnails/cloud.svg",
  cloud: "/thumbnails/cloud.svg",
  "Data Science": "/thumbnails/data-science.svg",
  "data science": "/thumbnails/data-science.svg",
  "data-science": "/thumbnails/data-science.svg",
  Robotics: "/thumbnails/robotics.svg",
  robotics: "/thumbnails/robotics.svg",
  "Quantum Computing": "/thumbnails/quantum.svg",
  "quantum computing": "/thumbnails/quantum.svg",
  quantum: "/thumbnails/quantum.svg",
  Startup: "/thumbnails/startup.svg",
  startup: "/thumbnails/startup.svg",
  Networking: "/thumbnails/networking.svg",
  networking: "/thumbnails/networking.svg",
  Workshops: "/thumbnails/workshops.svg",
  workshops: "/thumbnails/workshops.svg",
};

export interface ResolvedThumbnail {
  src: string;
  alt: string;
  isVerified: boolean;
  attribution: string;
}

/**
 * Returns the static category fallback SVG path for an event.
 */
export function getCategoryFallback(event: Partial<OrbitEvent>): string {
  const isHack = isHackathonEvent(event);
  const categoryKey = isHack ? "Hackathons" : (event.category || "Developer");
  return (
    STATIC_CATEGORY_SVGS[categoryKey] ||
    STATIC_CATEGORY_SVGS[categoryKey.toLowerCase()] ||
    "/thumbnails/developer.svg"
  );
}

/**
 * Returns the authentic verified thumbnail or category fallback artwork.
 */
export function getEventThumbnail(event: Partial<OrbitEvent>): ResolvedThumbnail {
  const isHack = isHackathonEvent(event);
  const categoryKey = isHack ? "Hackathons" : (event.category || "Developer");

  // 1. If authentic verified external thumbnail exists, return it
  if (
    event.thumbnail_url &&
    event.thumbnail_url.trim() !== "" &&
    event.thumbnail_verification_status === "verified"
  ) {
    return {
      src: event.thumbnail_url,
      alt: event.thumbnail_alt || `${event.name || "Tech Event"} — Official Banner`,
      isVerified: true,
      attribution: event.thumbnail_attribution || `Official ${event.organizer || "Organiser"} Asset`,
    };
  }

  // 2. High-aesthetic District category fallback static SVG
  const fallback = getCategoryFallback(event);

  return {
    src: fallback,
    alt: `${event.name || categoryKey} — ORBIT BLR Verified Series`,
    isVerified: false,
    attribution: "ORBIT BLR Verified Category Visual",
  };
}

/**
 * Returns a guaranteed raster (PNG/JPG) image for Open Graph and Twitter cards.
 * Social scrapers (WhatsApp, X, LinkedIn, Facebook) do not render SVG metadata images.
 */
export function getEventSocialImage(event: Partial<OrbitEvent>, siteUrl: string): { url: string; alt: string } {
  // 1. If authentic verified raster thumbnail exists and is not SVG
  if (
    event.thumbnail_url &&
    event.thumbnail_url.trim() !== "" &&
    event.thumbnail_verification_status === "verified" &&
    !event.thumbnail_url.endsWith(".svg")
  ) {
    return {
      url: event.thumbnail_url,
      alt: event.thumbnail_alt || `${event.name || "Tech Event"} — Official Banner`,
    };
  }

  // 2. High-resolution raster PNG category fallback
  const isHack = isHackathonEvent(event);
  const categoryKey = isHack ? "Hackathons" : (event.category || "Developer");
  const normKey = categoryKey.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");

  const categoryPngMap: Record<string, string> = {
    hackathons: "/thumbnails/hackathons.png",
    "ai-ml": "/thumbnails/ai-ml.png",
    ai: "/thumbnails/ai-ml.png",
    developer: "/thumbnails/developer.png",
    cybersecurity: "/thumbnails/cybersecurity.png",
    security: "/thumbnails/cybersecurity.png",
    cloud: "/thumbnails/cloud.png",
    "data-science": "/thumbnails/data-science.png",
    robotics: "/thumbnails/robotics.png",
    quantum: "/thumbnails/quantum.png",
    startup: "/thumbnails/startup.png",
    networking: "/thumbnails/networking.png",
    workshops: "/thumbnails/workshops.png",
  };

  const pngPath = categoryPngMap[normKey] || "/thumbnails/developer.png";
  return {
    url: `${siteUrl}${pngPath}`,
    alt: `${event.name || categoryKey} — ORBIT BLR Verified Series`,
  };
}

