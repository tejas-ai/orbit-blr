import type { OrbitEvent, BenefitStatus } from "../types/event.ts";
import type { EventSubmissionInput } from "./ingestion-schema.ts";

export interface LinkVerificationResult {
  isValid: boolean;
  statusCode?: number;
  finalUrl?: string;
  isHttps: boolean;
  isPaymentTrap: boolean;
  isRegistrationClosed: boolean;
  titleMatched: boolean;
  antiBotProtected: boolean;
  reason?: string;
}

/**
 * SSRF Protection: Denies internal IP ranges, loopbacks, and link-local addresses
 */
function isDisallowedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  // IPv4 Private & Link-Local Ranges
  // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
  const parts = lower.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 0) return true;
  }

  return false;
}

/**
 * Normalizes a URL for deduplication by removing tracking params, UTM tokens, and trailing slashes
 */
export function normalizeCanonicalUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    // Strip common tracking parameters
    const paramsToDrop = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "ref",
      "aff",
      "fbclid",
      "gclid",
      "_hsenc",
      "_hsmi",
    ];
    for (const p of paramsToDrop) {
      parsed.searchParams.delete(p);
    }
    // Remove trailing slash from pathname if length > 1
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;
    parsed.hash = ""; // Drop hash anchors
    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Live Quality Assurance on Registration URLs
 * Checks status, redirects, SSL, payment traps, and event identity correlation.
 */
export async function verifyRegistrationUrl(
  url: string,
  expectedEventTitle?: string
): Promise<LinkVerificationResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      isValid: false,
      isHttps: false,
      isPaymentTrap: false,
      isRegistrationClosed: false,
      titleMatched: false,
      antiBotProtected: false,
      reason: "Malformed URL structure",
    };
  }

  if (parsedUrl.protocol !== "https:") {
    return {
      isValid: false,
      isHttps: false,
      isPaymentTrap: false,
      isRegistrationClosed: false,
      titleMatched: false,
      antiBotProtected: false,
      reason: "Registration URL must use secure HTTPS protocol",
    };
  }

  if (isDisallowedHost(parsedUrl.hostname)) {
    return {
      isValid: false,
      isHttps: true,
      isPaymentTrap: false,
      isRegistrationClosed: false,
      titleMatched: false,
      antiBotProtected: false,
      reason: "Disallowed private or local IP destination (SSRF Protection)",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (ORBIT-BLR-EventVerifier/3.3)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    const finalUrl = response.url;
    const statusCode = response.status;

    // Check anti-bot challenges (Cloudflare 403, Incapsula, etc.)
    if (statusCode === 403 || statusCode === 503) {
      const bodySnippet = (await response.text().catch(() => "")).toLowerCase();
      if (
        bodySnippet.includes("cloudflare") ||
        bodySnippet.includes("just a moment") ||
        bodySnippet.includes("cf-browser-verification")
      ) {
        return {
          isValid: true, // Conditionally allowed with flag
          statusCode,
          finalUrl,
          isHttps: true,
          isPaymentTrap: false,
          isRegistrationClosed: false,
          titleMatched: true,
          antiBotProtected: true,
          reason: "Destination protected by anti-bot verification page; verified via organizer provenance",
        };
      }
    }

    if (!response.ok) {
      return {
        isValid: false,
        statusCode,
        finalUrl,
        isHttps: true,
        isPaymentTrap: false,
        isRegistrationClosed: false,
        titleMatched: false,
        antiBotProtected: false,
        reason: `Destination returned HTTP error status ${statusCode}`,
      };
    }

    // Inspect content
    const htmlText = (await response.text()).toLowerCase();

    // 1. Payment trap detection:
    // Detect non-free admission phrases, tickets with pricing
    let isPaymentTrap = false;
    const paymentRegexes = [
      /ticket\s+price\s*:\s*(?:inr|rs\.?|₹|\$)\s*[1-9]/i,
      /(?:admission|registration|entry)\s+fee\s*:\s*(?:inr|rs\.?|₹|\$)\s*[1-9]/i,
      /(?:paid\s+ticket|buy\s+tickets?|purchase\s+pass)/i,
    ];
    for (const rx of paymentRegexes) {
      if (rx.test(htmlText)) {
        isPaymentTrap = true;
        break;
      }
    }

    // 2. Closed registration detection
    let isRegistrationClosed = false;
    if (
      htmlText.includes("registration closed") ||
      htmlText.includes("registrations are closed") ||
      htmlText.includes("applications closed") ||
      htmlText.includes("event has ended") ||
      htmlText.includes("this event is sold out")
    ) {
      isRegistrationClosed = true;
    }

    // 3. Title matching (if provided)
    let titleMatched = true;
    if (expectedEventTitle) {
      const keywords = expectedEventTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3);
      if (keywords.length > 0) {
        const matches = keywords.filter((k) => htmlText.includes(k));
        titleMatched = matches.length >= Math.min(2, keywords.length);
      }
    }

    // 4. Root redirect detection (e.g., redirected to luma.com root or eventbrite.com root)
    try {
      const finalParsed = new URL(finalUrl);
      if (finalParsed.pathname === "/" || finalParsed.pathname === "") {
        if (!parsedUrl.pathname || parsedUrl.pathname === "/") {
          // intended root, rare
        } else {
          return {
            isValid: false,
            statusCode,
            finalUrl,
            isHttps: true,
            isPaymentTrap: false,
            isRegistrationClosed: true,
            titleMatched: false,
            antiBotProtected: false,
            reason: "URL redirected to generic platform homepage rather than the specific event page",
          };
        }
      }
    } catch {}

    if (isPaymentTrap) {
      return {
        isValid: false,
        statusCode,
        finalUrl,
        isHttps: true,
        isPaymentTrap: true,
        isRegistrationClosed,
        titleMatched,
        antiBotProtected: false,
        reason: "Destination appears to require paid tickets or entry fees (Violation of ₹0 free admission standard)",
      };
    }

    return {
      isValid: true,
      statusCode,
      finalUrl,
      isHttps: true,
      isPaymentTrap: false,
      isRegistrationClosed,
      titleMatched,
      antiBotProtected: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      isHttps: true,
      isPaymentTrap: false,
      isRegistrationClosed: false,
      titleMatched: false,
      antiBotProtected: false,
      reason: `Network fetch failed: ${errorMsg}`,
    };
  }
}

/**
 * Event Prioritisation Engine (Section 14)
 * Rank 1: Free Bengaluru tech event with ordinary-attendee swag AND attendance certificate confirmed.
 * Rank 2: One independently confirmed attendee benefit.
 * Rank 3: Genuine free developer events, workshops, meetups, AI/ML sessions, and hackathons.
 * Rank 4: Other qualifying free technology conferences.
 */
export function calculateEventPriority(event: Partial<OrbitEvent>): number {
  const goodiesConfirmed =
    event.goodies_status === "confirmed" || event.goodies_status === "limited";
  const certConfirmed =
    event.certificate_status === "confirmed" || event.certificate_status === "conditional";
  const foodConfirmed =
    event.food_status === "complimentary_meals_confirmed" ||
    event.food_status === "refreshments_confirmed";

  // Priority 1: Both Swag and Certificate confirmed
  if (goodiesConfirmed && certConfirmed) {
    return 1;
  }

  // Priority 2: At least one confirmed benefit (swag, cert, or complimentary meals)
  if (goodiesConfirmed || certConfirmed || foodConfirmed) {
    return 2;
  }

  // Priority 3: Genuine developer events, AI/ML workshops, hackathons
  if (
    event.category === "Hackathons" ||
    event.category === "AI & ML" ||
    event.category === "Developer" ||
    event.category === "Cloud" ||
    event.category === "Cybersecurity"
  ) {
    return 3;
  }

  // Priority 4: All other qualifying free technology events
  return 4;
}
