/**
 * Centralized Site & SEO Configuration for ORBIT BLR 3.0
 * Official Canonical Domain: https://orbit-blr.vercel.app
 */

export const PRODUCTION_DOMAIN = "https://orbit-blr.vercel.app";

function getResolvedSiteUrl(): string {
  // If explicitly provided via environment and not a legacy domain
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.startsWith("https://") && !envUrl.includes("orbitblr.in")) {
    return envUrl.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }

  return PRODUCTION_DOMAIN;
}

export const SITE_URL = getResolvedSiteUrl();

export const SITE_NAME = "ORBIT BLR";

export const HOMEPAGE_TITLE =
  "ORBIT BLR — Discover Free Tech Events & Hackathons in Bengaluru";

export const HOMEPAGE_DESCRIPTION =
  "Discover independently verified free tech meetups, AI workshops, developer conferences and hackathons in Bengaluru. Explore events and register through official organiser links.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
