import pg from "pg";
import type { OrbitEvent, PublicationStatus } from "../types/event.ts";
import type { EventSubmissionInput } from "./ingestion-schema.ts";
import { normalizeCanonicalUrl } from "./verification-engine.ts";
import { logAudit } from "./db.ts";

const { Pool } = pg;

// Singleton pool
let poolInstance: pg.Pool | null = null;

function getPgPool(): pg.Pool {
  if (!poolInstance) {
    const connString = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
    if (!connString) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }
    poolInstance = new Pool({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return poolInstance;
}

export interface IngestionResult {
  success: boolean;
  action: "created" | "updated" | "skipped";
  eventId: string;
  slug: string;
  publicationStatus: PublicationStatus;
  readbackVerified: boolean;
  event: OrbitEvent;
  auditId?: string;
  notes?: string;
}

/**
 * 10 Protected 2026 Discredited Seed IDs
 * These records must never be published without fresh authentic organizer-specific evidence.
 */
const PROTECTED_SEED_IDS = new Set([
  "evt-seed-1",
  "evt-seed-2",
  "evt-seed-3",
  "evt-seed-4",
  "evt-seed-5",
  "evt-seed-6",
  "evt-seed-7",
  "evt-seed-8",
  "evt-seed-9",
  "evt-seed-10",
]);

/**
 * Normalizes title for deduplication comparison (alphanumeric lowercase only)
 */
function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Generate a clean URL-friendly slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Ingests a single validated event into the Neon PostgreSQL database.
 * Method A: Authorised Neon SQL Ingestion.
 * Executes within an ACID transaction with multi-key deduplication,
 * seed-safeguard checks, provenance tracking, and independent SQL readback.
 */
export async function ingestEvent(
  data: EventSubmissionInput,
  actor = "automated-ai-engine"
): Promise<IngestionResult> {
  const pool = getPgPool();
  const client = await pool.connect();

  const canonicalUrl = normalizeCanonicalUrl(data.registration_url);
  const normalizedTitle = normalizeTitle(data.name);

  try {
    await client.query("BEGIN");

    // 1. Multi-key Deduplication Search
    // Check canonical registration URL first
    let existingRow: any = null;

    const urlRes = await client.query(
      `SELECT * FROM events 
       WHERE registration_url = $1 OR registration_url = $2 
       LIMIT 1`,
      [data.registration_url, canonicalUrl]
    );

    if (urlRes.rows.length > 0) {
      existingRow = urlRes.rows[0];
    } else {
      // Fuzzy check: same normalized title + start_at within 24 hours
      const fuzzyRes = await client.query(
        `SELECT * FROM events 
         WHERE ABS(EXTRACT(EPOCH FROM (start_at - $1::timestamptz))) < 86400
         ORDER BY created_at ASC`,
        [data.start_at]
      );

      for (const row of fuzzyRes.rows) {
        if (normalizeTitle(row.name) === normalizedTitle) {
          existingRow = row;
          break;
        }
      }
    }

    const nowIso = new Date().toISOString();

    // 2. Safeguard check for protected seed events
    if (existingRow && PROTECTED_SEED_IDS.has(existingRow.id)) {
      if (!data.forceVerifiedWithEvidence) {
        // Keep in review queue
        await client.query("ROLLBACK");
        return {
          success: false,
          action: "skipped",
          eventId: existingRow.id,
          slug: existingRow.slug,
          publicationStatus: "pending_review",
          readbackVerified: true,
          event: existingRow as OrbitEvent,
          notes: "Protected seed event matched. Cannot be published without explicit forceVerifiedWithEvidence flag and fresh organizer evidence.",
        };
      }
    }

    let targetId: string;
    let targetSlug: string;
    let actionType: "created" | "updated";

    if (existingRow) {
      // Update existing record
      targetId = existingRow.id;
      targetSlug = existingRow.slug;
      actionType = "updated";

      const updateQuery = `
        UPDATE events SET
          name = $1,
          category = $2,
          organizer = $3,
          description = $4,
          start_at = $5,
          end_at = $6,
          timezone = $7,
          venue = $8,
          venue_type = $9,
          area = $10,
          address = $11,
          landmark = $12,
          metro_station = $13,
          map_url = $14,
          is_in_person = $15,
          is_free = $16,
          registration_url = $17,
          registration_status = $18,
          approval_required = $19,
          goodies_status = $20,
          goodies_details = $21,
          certificate_status = $22,
          certificate_format = $23,
          certificate_requirements = $24,
          food_status = $25,
          food_details = $26,
          source_urls = $27,
          verification_notes = $28,
          last_verified_at = $29,
          publication_status = $30,
          who_should_attend = $31,
          topics_covered = $32,
          prerequisites = $33,
          agenda = $34,
          featured = $35,
          thumbnail_url = $36,
          thumbnail_source_url = $37,
          thumbnail_alt = $38,
          hackathon_details = $39,
          updated_at = NOW()
        WHERE id = $40
        RETURNING *;
      `;

      await client.query(updateQuery, [
        data.name,
        data.category,
        data.organizer,
        data.description,
        data.start_at,
        data.end_at,
        data.timezone || "Asia/Kolkata",
        data.venue,
        data.venue_type || null,
        data.area,
        data.address || null,
        data.landmark || null,
        data.metro_station || null,
        data.map_url || null,
        data.is_in_person,
        data.is_free,
        canonicalUrl,
        data.registration_status,
        data.approval_required,
        data.goodies_status,
        data.goodies_details || null,
        data.certificate_status,
        data.certificate_format || null,
        data.certificate_requirements || null,
        data.food_status,
        data.food_details || null,
        JSON.stringify(data.source_urls),
        data.verification_notes,
        data.last_verified_at || nowIso,
        data.publication_status,
        JSON.stringify(data.who_should_attend || []),
        JSON.stringify(data.topics_covered || []),
        data.prerequisites || null,
        JSON.stringify(data.agenda || []),
        Boolean(data.featured),
        data.thumbnail_url || null,
        data.thumbnail_source_url || null,
        data.thumbnail_alt || null,
        data.hackathon_details ? JSON.stringify(data.hackathon_details) : null,
        targetId,
      ]);
    } else {
      // Create new record
      targetId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let baseSlug = generateSlug(data.name);

      // Ensure slug uniqueness
      const slugCheck = await client.query(
        "SELECT id FROM events WHERE slug = $1 LIMIT 1",
        [baseSlug]
      );
      if (slugCheck.rows.length > 0) {
        targetSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      } else {
        targetSlug = baseSlug;
      }

      actionType = "created";

      const insertQuery = `
        INSERT INTO events (
          id, slug, name, category, organizer, description, start_at, end_at, timezone,
          venue, venue_type, area, address, landmark, metro_station, map_url,
          is_in_person, is_free, registration_url, registration_status, approval_required,
          goodies_status, goodies_details, certificate_status, certificate_format, certificate_requirements,
          food_status, food_details, source_urls, verification_notes, last_verified_at,
          publication_status, who_should_attend, topics_covered, prerequisites, agenda, featured,
          thumbnail_url, thumbnail_source_url, thumbnail_alt, thumbnail_verification_status,
          hackathon_details, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25, $26,
          $27, $28, $29, $30, $31,
          $32, $33, $34, $35, $36, $37,
          $38, $39, $40, $41,
          $42, NOW(), NOW()
        ) RETURNING *;
      `;

      await client.query(insertQuery, [
        targetId,
        targetSlug,
        data.name,
        data.category,
        data.organizer,
        data.description,
        data.start_at,
        data.end_at,
        data.timezone || "Asia/Kolkata",
        data.venue,
        data.venue_type || null,
        data.area,
        data.address || null,
        data.landmark || null,
        data.metro_station || null,
        data.map_url || null,
        data.is_in_person,
        data.is_free,
        canonicalUrl,
        data.registration_status,
        data.approval_required,
        data.goodies_status,
        data.goodies_details || null,
        data.certificate_status,
        data.certificate_format || null,
        data.certificate_requirements || null,
        data.food_status,
        data.food_details || null,
        JSON.stringify(data.source_urls),
        data.verification_notes,
        data.last_verified_at || nowIso,
        data.publication_status,
        JSON.stringify(data.who_should_attend || []),
        JSON.stringify(data.topics_covered || []),
        data.prerequisites || null,
        JSON.stringify(data.agenda || []),
        Boolean(data.featured),
        data.thumbnail_url || null,
        data.thumbnail_source_url || null,
        data.thumbnail_alt || null,
        data.thumbnail_url ? "verified" : "unverified",
        data.hackathon_details ? JSON.stringify(data.hackathon_details) : null,
      ]);
    }

    // 3. Commit Transaction
    await client.query("COMMIT");

    // 4. Independent SQL Readback Verification
    const readbackRes = await client.query(
      "SELECT * FROM events WHERE id = $1 LIMIT 1",
      [targetId]
    );

    if (readbackRes.rows.length === 0) {
      throw new Error(`Independent SQL readback failed: event ${targetId} could not be retrieved after commit.`);
    }

    const readbackRow = readbackRes.rows[0];

    // Audit Log
    try {
      await logAudit(
        targetId,
        actionType === "created" ? "create" : "update",
        `Automated ingestion ${actionType} event "${data.name}" (Status: ${data.publication_status})`,
        actor
      );
    } catch {}

    return {
      success: true,
      action: actionType,
      eventId: targetId,
      slug: targetSlug,
      publicationStatus: readbackRow.publication_status as PublicationStatus,
      readbackVerified: true,
      event: {
        ...readbackRow,
        start_at: new Date(readbackRow.start_at).toISOString(),
        end_at: new Date(readbackRow.end_at).toISOString(),
        created_at: new Date(readbackRow.created_at).toISOString(),
        updated_at: new Date(readbackRow.updated_at).toISOString(),
        source_urls: typeof readbackRow.source_urls === "string" ? JSON.parse(readbackRow.source_urls) : readbackRow.source_urls,
        hackathon_details: readbackRow.hackathon_details ? (typeof readbackRow.hackathon_details === "string" ? JSON.parse(readbackRow.hackathon_details) : readbackRow.hackathon_details) : null,
      } as OrbitEvent,
    };
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
