import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  EventSubmissionSchema,
  BatchEventSubmissionSchema,
  EventSubmissionInput,
} from "@/lib/ingestion-schema";
import { verifyRegistrationUrl } from "@/lib/verification-engine";
import { ingestEvent, IngestionResult } from "@/lib/event-ingestion";

export const dynamic = "force-dynamic";

/**
 * Constant-time comparison to prevent timing side-channel attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// In-memory sliding window rate limiter (120 requests / minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 120) {
    return false;
  }
  entry.count++;
  return true;
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

/**
 * POST /api/internal/event-ingestion
 * Secure Machine-to-Machine Ingestion API for Authorized AI Assistants and Automations
 */
export async function POST(request: NextRequest) {
  // 1. Rate Limiting Check
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before submitting more events." },
      { status: 429, headers: NO_CACHE_HEADERS }
    );
  }

  // 2. Server-side Authentication
  // Accepts Authorization: Bearer <secret> or x-orbit-ingest-key: <secret>
  const authHeader =
    request.headers.get("authorization") || request.headers.get("x-orbit-ingest-key");
  const expectedSecret =
    process.env.ORBIT_API_SECRET || process.env.ORBIT_INGESTION_SECRET;

  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  if (!expectedSecret || !token || !timingSafeCompare(token, expectedSecret)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing ingestion credentials." },
      { status: 401, headers: NO_CACHE_HEADERS }
    );
  }

  // 3. Replay Protection / Timestamp Check (optional header)
  const timestampHeader = request.headers.get("x-orbit-timestamp");
  if (timestampHeader) {
    const requestTime = parseInt(timestampHeader, 10);
    const now = Date.now();
    if (isNaN(requestTime) || Math.abs(now - requestTime) > 300000) {
      // > 5 minutes drift
      return NextResponse.json(
        { error: "Request expired: timestamp drift exceeds allowed 5-minute window." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
  }

  // 4. Parse Request Payload
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON payload in request body." },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  // Check if single event or batch submission
  const isBatch =
    typeof rawBody === "object" && rawBody !== null && "events" in rawBody;

  let eventsToIngest: EventSubmissionInput[] = [];
  let skipLinkCheck = false;

  if (isBatch) {
    const parseResult = BatchEventSubmissionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Batch schema validation failed.",
          issues: parseResult.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    eventsToIngest = parseResult.data.events;
    skipLinkCheck = parseResult.data.skipLiveLinkCheck;
  } else {
    const parseResult = EventSubmissionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Event schema validation failed.",
          issues: parseResult.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    eventsToIngest = [parseResult.data];
    skipLinkCheck = Boolean((rawBody as any)?.skipLiveLinkCheck);
  }

  // 5. Ingestion & Quality Assurance Pipeline
  const results: IngestionResult[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  for (const eventData of eventsToIngest) {
    try {
      // Live Registration Link QA (unless explicitly skipped by pre-verified crawler)
      if (!skipLinkCheck) {
        const linkCheck = await verifyRegistrationUrl(
          eventData.registration_url,
          eventData.name
        );
        if (!linkCheck.isValid) {
          errors.push({
            name: eventData.name,
            error: `Registration URL QA failed: ${linkCheck.reason || "Invalid link destination"}`,
          });
          continue;
        }
      }

      // Execute ACID Ingestion with independent readback
      const result = await ingestEvent(eventData, eventData.verified_by || "ai-automation-api");
      results.push(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({
        name: eventData.name,
        error: `Database ingestion failed: ${msg}`,
      });
    }
  }

  // 6. Return Structured Results
  const allSucceeded = errors.length === 0 && results.length > 0;
  const partialSucceeded = results.length > 0 && errors.length > 0;

  const responseStatus = allSucceeded ? 200 : partialSucceeded ? 207 : 422;

  return NextResponse.json(
    {
      success: allSucceeded,
      partialSuccess: partialSucceeded,
      totalSubmitted: eventsToIngest.length,
      ingestedCount: results.length,
      failedCount: errors.length,
      results: results.map((r) => ({
        action: r.action,
        eventId: r.eventId,
        slug: r.slug,
        publicationStatus: r.publicationStatus,
        readbackVerified: r.readbackVerified,
        name: r.event.name,
        start_at: r.event.start_at,
        venue: r.event.venue,
        area: r.event.area,
        category: r.event.category,
        registration_url: r.event.registration_url,
      })),
      errors,
    },
    {
      status: responseStatus,
      headers: NO_CACHE_HEADERS,
    }
  );
}
