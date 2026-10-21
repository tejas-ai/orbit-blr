import pg from "pg";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type {
  OrbitEvent,
  EventSuggestion,
  AuditLogEntry,
  EventFilters,
  PublicationStatus,
} from "../types/event.ts";
import { SEED_EVENTS } from "./seed-data.ts";
import { isHackathonEvent } from "./hackathons.ts";

const { Pool } = pg;

// Global singleton for Next.js hot-reloading
const globalForDb = globalThis as unknown as {
  orbitPgPool?: pg.Pool;
  orbitSqliteDb?: DatabaseSync;
};

function getPgPool(): pg.Pool | null {
  const connString = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!connString) return null;

  if (!globalForDb.orbitPgPool) {
    globalForDb.orbitPgPool = new Pool({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalForDb.orbitPgPool;
}

function getSqliteDb(): DatabaseSync {
  if (globalForDb.orbitSqliteDb) {
    return globalForDb.orbitSqliteDb;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "orbit.db");
  const db = new DatabaseSync(dbPath);

  // Initialize SQLite Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      organizer TEXT NOT NULL,
      description TEXT NOT NULL,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
      venue TEXT NOT NULL,
      venue_type TEXT,
      area TEXT NOT NULL,
      address TEXT,
      landmark TEXT,
      metro_station TEXT,
      map_url TEXT,
      is_in_person INTEGER NOT NULL DEFAULT 1,
      is_free INTEGER NOT NULL DEFAULT 1,
      registration_url TEXT NOT NULL,
      registration_status TEXT NOT NULL DEFAULT 'open',
      approval_required INTEGER NOT NULL DEFAULT 0,
      goodies_status TEXT NOT NULL DEFAULT 'unverified',
      goodies_details TEXT,
      certificate_status TEXT NOT NULL DEFAULT 'unverified',
      certificate_format TEXT,
      certificate_requirements TEXT,
      food_status TEXT NOT NULL DEFAULT 'unverified',
      food_details TEXT,
      source_urls TEXT NOT NULL DEFAULT '[]',
      verification_notes TEXT,
      last_verified_at TEXT,
      publication_status TEXT NOT NULL DEFAULT 'published',
      who_should_attend TEXT,
      topics_covered TEXT,
      prerequisites TEXT,
      agenda TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      thumbnail_url TEXT,
      thumbnail_source_url TEXT,
      thumbnail_alt TEXT,
      thumbnail_verification_status TEXT DEFAULT 'unverified',
      thumbnail_verified_at TEXT,
      thumbnail_attribution TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      event_url TEXT NOT NULL,
      event_name TEXT,
      organizer TEXT,
      notes TEXT,
      submitter_email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'system',
      timestamp TEXT NOT NULL
    );
  `);

  globalForDb.orbitSqliteDb = db;
  return db;
}

// Convert DB row to typed OrbitEvent
function mapRowToEvent(row: Record<string, unknown>): OrbitEvent {
  const parseJsonField = (val: unknown) => {
    if (!val) return [];
    if (typeof val === "object") return val as any;
    try {
      return JSON.parse(String(val));
    } catch {
      return [];
    }
  };

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: row.category as OrbitEvent["category"],
    organizer: String(row.organizer),
    description: String(row.description),
    start_at: new Date(String(row.start_at)).toISOString(),
    end_at: new Date(String(row.end_at)).toISOString(),
    timezone: String(row.timezone || "Asia/Kolkata"),
    venue: String(row.venue),
    venue_type: (row.venue_type as OrbitEvent["venue_type"]) || undefined,
    area: String(row.area),
    address: row.address ? String(row.address) : null,
    landmark: row.landmark ? String(row.landmark) : null,
    metro_station: row.metro_station ? String(row.metro_station) : null,
    map_url: row.map_url ? String(row.map_url) : null,
    is_in_person: Boolean(row.is_in_person),
    is_free: Boolean(row.is_free),
    registration_url: String(row.registration_url),
    registration_status: row.registration_status as OrbitEvent["registration_status"],
    approval_required: Boolean(row.approval_required),
    goodies_status: row.goodies_status as OrbitEvent["goodies_status"],
    goodies_details: row.goodies_details ? String(row.goodies_details) : null,
    certificate_status: row.certificate_status as OrbitEvent["certificate_status"],
    certificate_format: (row.certificate_format as OrbitEvent["certificate_format"]) || null,
    certificate_requirements: row.certificate_requirements ? String(row.certificate_requirements) : null,
    food_status: row.food_status as OrbitEvent["food_status"],
    food_details: row.food_details ? String(row.food_details) : null,
    source_urls: parseJsonField(row.source_urls),
    verification_notes: row.verification_notes ? String(row.verification_notes) : null,
    last_verified_at: row.last_verified_at ? new Date(String(row.last_verified_at)).toISOString() : null,
    publication_status: row.publication_status as OrbitEvent["publication_status"],
    who_should_attend: parseJsonField(row.who_should_attend),
    topics_covered: parseJsonField(row.topics_covered),
    prerequisites: row.prerequisites ? String(row.prerequisites) : null,
    agenda: parseJsonField(row.agenda),
    hackathon_details: row.hackathon_details
      ? typeof row.hackathon_details === "object"
        ? (row.hackathon_details as any)
        : parseJsonField(row.hackathon_details)
      : null,
    featured: Boolean(row.featured),
    thumbnail_url: row.thumbnail_url ? String(row.thumbnail_url) : null,
    thumbnail_source_url: row.thumbnail_source_url ? String(row.thumbnail_source_url) : null,
    thumbnail_alt: row.thumbnail_alt ? String(row.thumbnail_alt) : null,
    thumbnail_verification_status: (row.thumbnail_verification_status as OrbitEvent["thumbnail_verification_status"]) || null,
    thumbnail_verified_at: row.thumbnail_verified_at ? new Date(String(row.thumbnail_verified_at)).toISOString() : null,
    thumbnail_attribution: row.thumbnail_attribution ? String(row.thumbnail_attribution) : null,
    created_at: new Date(String(row.created_at || Date.now())).toISOString(),
    updated_at: new Date(String(row.updated_at || Date.now())).toISOString(),
  };
}

export async function getAllEvents(options?: { includeUnpublished?: boolean }): Promise<OrbitEvent[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const query = options?.includeUnpublished
        ? "SELECT * FROM events ORDER BY start_at ASC"
        : "SELECT * FROM events WHERE publication_status = 'published' ORDER BY start_at ASC";
      const res = await pool.query(query);
      return res.rows.map(mapRowToEvent);
    } catch (err: unknown) {
      console.warn("PostgreSQL getAllEvents warning (falling back):", err instanceof Error ? err.message : err);
    }
  }

  // SQLite fallback
  try {
    const db = getSqliteDb();
    const query = options?.includeUnpublished
      ? "SELECT * FROM events ORDER BY start_at ASC"
      : "SELECT * FROM events WHERE publication_status = 'published' ORDER BY start_at ASC";
    const rows = db.prepare(query).all() as Record<string, unknown>[];
    return rows.map(mapRowToEvent);
  } catch {
    return options?.includeUnpublished
      ? SEED_EVENTS
      : SEED_EVENTS.filter((e) => e.publication_status === "published");
  }
}

export async function getFilteredEvents(
  filters: EventFilters,
  options?: { includeUnpublished?: boolean }
): Promise<OrbitEvent[]> {
  let events = await getAllEvents(options);

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    events = events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.area.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.topics_covered && e.topics_covered.some((t) => t.toLowerCase().includes(q)))
    );
  }

  if (filters.category && filters.category !== "all") {
    const targetCat = filters.category.toLowerCase();
    if (targetCat === "hackathons" || targetCat === "hackathon") {
      events = events.filter((e) => isHackathonEvent(e));
    } else {
      events = events.filter((e) => e.category && e.category.toLowerCase() === targetCat);
    }
  }

  if (filters.area && filters.area !== "all") {
    events = events.filter((e) => e.area.toLowerCase() === (filters.area as string).toLowerCase());
  }

  if (filters.registrationStatus && filters.registrationStatus !== "all") {
    events = events.filter((e) => e.registration_status === filters.registrationStatus);
  }

  if (filters.venueType && filters.venueType !== "all") {
    events = events.filter((e) => e.venue_type === filters.venueType);
  }

  if (filters.benefits && filters.benefits !== "all") {
    if (filters.benefits === "both_confirmed") {
      events = events.filter(
        (e) =>
          (e.goodies_status === "confirmed" || e.goodies_status === "limited") &&
          (e.certificate_status === "confirmed" || e.certificate_status === "conditional")
      );
    } else if (filters.benefits === "certificates_confirmed") {
      events = events.filter(
        (e) => e.certificate_status === "confirmed" || e.certificate_status === "conditional"
      );
    } else if (filters.benefits === "goodies_confirmed") {
      events = events.filter((e) => e.goodies_status === "confirmed" || e.goodies_status === "limited");
    } else if (filters.benefits === "complimentary_food") {
      events = events.filter(
        (e) =>
          e.food_status === "complimentary_meals_confirmed" || e.food_status === "refreshments_confirmed"
      );
    }
  }

  if (filters.dateFilter && filters.dateFilter !== "all") {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    events = events.filter((e) => {
      const eventDateStr = e.start_at.split("T")[0];
      const eventDate = new Date(e.start_at);

      if (filters.dateFilter === "today") return eventDateStr === todayStr;
      if (filters.dateFilter === "tomorrow") {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return eventDateStr === tomorrow.toISOString().split("T")[0];
      }
      if (filters.dateFilter === "weekend") {
        const day = eventDate.getDay();
        return day === 0 || day === 6;
      }
      if (filters.dateFilter === "next_7_days") {
        const next7 = new Date(now);
        next7.setDate(now.getDate() + 7);
        return eventDate >= now && eventDate <= next7;
      }
      if (filters.dateFilter === "this_month") {
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }
      if (filters.dateFilter === "custom" && filters.customDate) {
        return eventDateStr === filters.customDate;
      }
      return true;
    });
  }

  // Sorting
  if (filters.sortBy === "date_asc") {
    events.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  } else if (filters.sortBy === "date_desc") {
    events.sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
  } else if (filters.sortBy === "urgency") {
    const priority: Record<string, number> = {
      open: 1,
      approval_required: 2,
      waitlist: 3,
      not_yet_open: 4,
      full: 5,
      closed: 6,
    };
    events.sort((a, b) => (priority[a.registration_status] || 99) - (priority[b.registration_status] || 99));
  } else if (filters.sortBy === "benefits") {
    const score = (e: OrbitEvent) => {
      let s = 0;
      if (e.goodies_status === "confirmed") s += 3;
      if (e.goodies_status === "limited") s += 1;
      if (e.certificate_status === "confirmed") s += 3;
      if (e.certificate_status === "conditional") s += 2;
      if (e.food_status === "complimentary_meals_confirmed") s += 2;
      if (e.food_status === "refreshments_confirmed") s += 1;
      return s;
    };
    events.sort((a, b) => score(b) - score(a));
  }

  return events;
}

export async function getEventBySlug(slug: string): Promise<OrbitEvent | null> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM events WHERE slug = $1", [slug]);
      if (res.rows[0]) return mapRowToEvent(res.rows[0]);
    } catch (err: unknown) {
      console.warn("PostgreSQL getEventBySlug warning (falling back):", err instanceof Error ? err.message : err);
    }
  }

  try {
    const db = getSqliteDb();
    const row = db.prepare("SELECT * FROM events WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
    if (row) return mapRowToEvent(row);
  } catch {
    // ignore
  }

  const seed = SEED_EVENTS.find((e) => e.slug === slug);
  return seed || null;
}

export async function getEventById(id: string): Promise<OrbitEvent | null> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
      if (res.rows[0]) return mapRowToEvent(res.rows[0]);
    } catch (err: unknown) {
      console.warn("PostgreSQL getEventById warning (falling back):", err instanceof Error ? err.message : err);
    }
  }

  try {
    const db = getSqliteDb();
    const row = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (row) return mapRowToEvent(row);
  } catch {
    // ignore
  }

  const seed = SEED_EVENTS.find((e) => e.id === id);
  return seed || null;
}

export async function createEvent(data: Partial<OrbitEvent>, actor = "admin"): Promise<OrbitEvent> {
  const now = new Date().toISOString();
  const id = data.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const slug =
    data.slug ||
    (data.name || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const pool = getPgPool();
  if (pool) {
    const insertQuery = `
      INSERT INTO events (
        id, slug, name, category, organizer, description, start_at, end_at, timezone,
        venue, venue_type, area, address, landmark, metro_station, map_url,
        is_in_person, is_free, registration_url, registration_status, approval_required,
        goodies_status, goodies_details, certificate_status, certificate_format, certificate_requirements,
        food_status, food_details, source_urls, verification_notes, last_verified_at,
        publication_status, who_should_attend, topics_covered, prerequisites, agenda, featured,
        thumbnail_url, thumbnail_source_url, thumbnail_alt, thumbnail_verification_status, thumbnail_verified_at, thumbnail_attribution,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31,
        $32, $33, $34, $35, $36, $37,
        $38, $39, $40, $41, $42, $43,
        $44, $45
      ) RETURNING *;
    `;

    const res = await pool.query(insertQuery, [
      id,
      slug,
      data.name || "Untitled Tech Event",
      data.category || "Developer",
      data.organizer || "Independent Community",
      data.description || "",
      data.start_at || now,
      data.end_at || now,
      data.timezone || "Asia/Kolkata",
      data.venue || "Bengaluru Venue TBA",
      data.venue_type || null,
      data.area || "Bengaluru",
      data.address || null,
      data.landmark || null,
      data.metro_station || null,
      data.map_url || null,
      data.is_in_person === false ? false : true,
      data.is_free === false ? false : true,
      data.registration_url || "https://example.com",
      data.registration_status || "open",
      data.approval_required ? true : false,
      data.goodies_status || "unverified",
      data.goodies_details || null,
      data.certificate_status || "unverified",
      data.certificate_format || null,
      data.certificate_requirements || null,
      data.food_status || "unverified",
      data.food_details || null,
      JSON.stringify(data.source_urls || []),
      data.verification_notes || null,
      data.last_verified_at || now,
      data.publication_status || "pending_review",
      JSON.stringify(data.who_should_attend || []),
      JSON.stringify(data.topics_covered || []),
      data.prerequisites || null,
      JSON.stringify(data.agenda || []),
      data.featured ? true : false,
      data.thumbnail_url || null,
      data.thumbnail_source_url || null,
      data.thumbnail_alt || null,
      data.thumbnail_verification_status || "unverified",
      data.thumbnail_verified_at || null,
      data.thumbnail_attribution || null,
      now,
      now,
    ]);

    await logAudit(id, "create", `Created event "${data.name}"`, actor);
    return mapRowToEvent(res.rows[0]);
  }

  // SQLite fallback
  const db = getSqliteDb();
  const stmt = db.prepare(`
    INSERT INTO events (
      id, slug, name, category, organizer, description, start_at, end_at, timezone,
      venue, venue_type, area, address, landmark, metro_station, map_url,
      is_in_person, is_free, registration_url, registration_status, approval_required,
      goodies_status, goodies_details, certificate_status, certificate_format, certificate_requirements,
      food_status, food_details, source_urls, verification_notes, last_verified_at,
      publication_status, who_should_attend, topics_covered, prerequisites, agenda, featured,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  stmt.run(
    id,
    slug,
    data.name || "Untitled Tech Event",
    data.category || "Developer",
    data.organizer || "Independent Community",
    data.description || "",
    data.start_at || now,
    data.end_at || now,
    data.timezone || "Asia/Kolkata",
    data.venue || "Bengaluru Venue TBA",
    data.venue_type || null,
    data.area || "Bengaluru",
    data.address || null,
    data.landmark || null,
    data.metro_station || null,
    data.map_url || null,
    data.is_in_person === false ? 0 : 1,
    data.is_free === false ? 0 : 1,
    data.registration_url || "https://example.com",
    data.registration_status || "open",
    data.approval_required ? 1 : 0,
    data.goodies_status || "unverified",
    data.goodies_details || null,
    data.certificate_status || "unverified",
    data.certificate_format || null,
    data.certificate_requirements || null,
    data.food_status || "unverified",
    data.food_details || null,
    JSON.stringify(data.source_urls || []),
    data.verification_notes || null,
    data.last_verified_at || now,
    data.publication_status || "pending_review",
    JSON.stringify(data.who_should_attend || []),
    JSON.stringify(data.topics_covered || []),
    data.prerequisites || null,
    JSON.stringify(data.agenda || []),
    data.featured ? 1 : 0,
    now,
    now
  );

  await logAudit(id, "create", `Created event "${data.name}"`, actor);
  return (await getEventById(id))!;
}

export async function updateEvent(
  id: string,
  data: Partial<OrbitEvent>,
  actor = "admin"
): Promise<OrbitEvent | null> {
  const existing = await getEventById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const merged: OrbitEvent = {
    ...existing,
    ...data,
    updated_at: now,
  };

  const pool = getPgPool();
  if (pool) {
    const updateQuery = `
      UPDATE events SET
        slug = $1, name = $2, category = $3, organizer = $4, description = $5,
        start_at = $6, end_at = $7, timezone = $8, venue = $9, venue_type = $10,
        area = $11, address = $12, landmark = $13, metro_station = $14, map_url = $15,
        is_in_person = $16, is_free = $17, registration_url = $18, registration_status = $19, approval_required = $20,
        goodies_status = $21, goodies_details = $22, certificate_status = $23, certificate_format = $24, certificate_requirements = $25,
        food_status = $26, food_details = $27, source_urls = $28, verification_notes = $29, last_verified_at = $30,
        publication_status = $31, who_should_attend = $32, topics_covered = $33, prerequisites = $34, agenda = $35,
        featured = $36, thumbnail_url = $37, thumbnail_source_url = $38, thumbnail_alt = $39,
        thumbnail_verification_status = $40, thumbnail_verified_at = $41, thumbnail_attribution = $42, updated_at = $43
      WHERE id = $44 RETURNING *;
    `;

    const res = await pool.query(updateQuery, [
      merged.slug,
      merged.name,
      merged.category,
      merged.organizer,
      merged.description,
      merged.start_at,
      merged.end_at,
      merged.timezone,
      merged.venue,
      merged.venue_type || null,
      merged.area,
      merged.address || null,
      merged.landmark || null,
      merged.metro_station || null,
      merged.map_url || null,
      merged.is_in_person ? true : false,
      merged.is_free ? true : false,
      merged.registration_url,
      merged.registration_status,
      merged.approval_required ? true : false,
      merged.goodies_status,
      merged.goodies_details || null,
      merged.certificate_status,
      merged.certificate_format || null,
      merged.certificate_requirements || null,
      merged.food_status,
      merged.food_details || null,
      JSON.stringify(merged.source_urls || []),
      merged.verification_notes || null,
      merged.last_verified_at || null,
      merged.publication_status,
      JSON.stringify(merged.who_should_attend || []),
      JSON.stringify(merged.topics_covered || []),
      merged.prerequisites || null,
      JSON.stringify(merged.agenda || []),
      merged.featured ? true : false,
      merged.thumbnail_url || null,
      merged.thumbnail_source_url || null,
      merged.thumbnail_alt || null,
      merged.thumbnail_verification_status || "unverified",
      merged.thumbnail_verified_at || null,
      merged.thumbnail_attribution || null,
      now,
      id,
    ]);

    await logAudit(id, "update", `Updated event fields: ${Object.keys(data).join(", ")}`, actor);
    return mapRowToEvent(res.rows[0]);
  }

  // SQLite fallback
  const db = getSqliteDb();
  const stmt = db.prepare(`
    UPDATE events SET
      slug = ?, name = ?, category = ?, organizer = ?, description = ?,
      start_at = ?, end_at = ?, timezone = ?, venue = ?, venue_type = ?,
      area = ?, address = ?, landmark = ?, metro_station = ?, map_url = ?,
      is_in_person = ?, is_free = ?, registration_url = ?, registration_status = ?, approval_required = ?,
      goodies_status = ?, goodies_details = ?, certificate_status = ?, certificate_format = ?, certificate_requirements = ?,
      food_status = ?, food_details = ?, source_urls = ?, verification_notes = ?, last_verified_at = ?,
      publication_status = ?, who_should_attend = ?, topics_covered = ?, prerequisites = ?, agenda = ?,
      featured = ?, updated_at = ?
    WHERE id = ?
  `);

  stmt.run(
    merged.slug,
    merged.name,
    merged.category,
    merged.organizer,
    merged.description,
    merged.start_at,
    merged.end_at,
    merged.timezone,
    merged.venue,
    merged.venue_type || null,
    merged.area,
    merged.address || null,
    merged.landmark || null,
    merged.metro_station || null,
    merged.map_url || null,
    merged.is_in_person ? 1 : 0,
    merged.is_free ? 1 : 0,
    merged.registration_url,
    merged.registration_status,
    merged.approval_required ? 1 : 0,
    merged.goodies_status,
    merged.goodies_details || null,
    merged.certificate_status,
    merged.certificate_format || null,
    merged.certificate_requirements || null,
    merged.food_status,
    merged.food_details || null,
    JSON.stringify(merged.source_urls || []),
    merged.verification_notes || null,
    merged.last_verified_at || null,
    merged.publication_status,
    JSON.stringify(merged.who_should_attend || []),
    JSON.stringify(merged.topics_covered || []),
    merged.prerequisites || null,
    JSON.stringify(merged.agenda || []),
    merged.featured ? 1 : 0,
    now,
    id
  );

  await logAudit(id, "update", `Updated event fields: ${Object.keys(data).join(", ")}`, actor);
  return (await getEventById(id))!;
}

export async function deleteEvent(id: string, actor = "admin"): Promise<boolean> {
  const existing = await getEventById(id);
  if (!existing) return false;

  const pool = getPgPool();
  if (pool) {
    await pool.query("DELETE FROM events WHERE id = $1", [id]);
    await logAudit(id, "update", `Deleted event "${existing.name}"`, actor);
    return true;
  }

  const db = getSqliteDb();
  db.prepare("DELETE FROM events WHERE id = ?").run(id);
  await logAudit(id, "update", `Deleted event "${existing.name}"`, actor);
  return true;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export async function upsertEventsBatch(
  events: Partial<OrbitEvent>[],
  actor = "automation"
): Promise<ImportResult> {
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const item of events) {
    try {
      if (!item.name || !item.registration_url) {
        result.skipped++;
        result.errors.push(`Skipped record without name or registration_url: ${JSON.stringify(item)}`);
        continue;
      }

      // Check duplicates by registration_url, id, or slug
      let existing: OrbitEvent | null = null;
      if (item.id) existing = await getEventById(item.id);
      if (!existing && item.slug) existing = await getEventBySlug(item.slug);
      if (!existing && item.registration_url) {
        const pool = getPgPool();
        if (pool) {
          const res = await pool.query("SELECT * FROM events WHERE registration_url = $1", [
            item.registration_url,
          ]);
          if (res.rows[0]) existing = mapRowToEvent(res.rows[0]);
        } else {
          const db = getSqliteDb();
          const row = db
            .prepare("SELECT * FROM events WHERE registration_url = ?")
            .get(item.registration_url) as Record<string, unknown> | undefined;
          if (row) existing = mapRowToEvent(row);
        }
      }

      if (existing) {
        await updateEvent(existing.id, item, actor);
        result.updated++;
      } else {
        // Enforce review queue for unverified or external automated submissions
        const eventToCreate = {
          ...item,
          publication_status:
            item.publication_status && item.source_urls && item.source_urls.length > 0
              ? item.publication_status
              : ("pending_review" as PublicationStatus),
        };
        await createEvent(eventToCreate, actor);
        result.created++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors.push(`Error processing ${item.name || "unknown"}: ${msg}`);
      result.skipped++;
    }
  }

  return result;
}

export async function logAudit(
  eventId: string,
  action: AuditLogEntry["action"],
  details: string,
  actor = "system"
) {
  try {
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const pool = getPgPool();
    if (pool) {
      await pool.query(
        "INSERT INTO audit_logs (id, event_id, action, details, actor, timestamp) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, eventId, action, details, actor, now]
      );
      return;
    }

    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO audit_logs (id, event_id, action, details, actor, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, eventId, action, details, actor, now);
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

export async function getAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  const pool = getPgPool();
  if (pool) {
    const res = await pool.query("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1", [limit]);
    return res.rows.map((r) => ({
      id: String(r.id),
      event_id: String(r.event_id),
      action: r.action as AuditLogEntry["action"],
      details: String(r.details),
      actor: String(r.actor),
      timestamp: String(r.timestamp),
    }));
  }

  const db = getSqliteDb();
  const rows = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?").all(limit) as Record<
    string,
    unknown
  >[];
  return rows.map((r) => ({
    id: String(r.id),
    event_id: String(r.event_id),
    action: r.action as AuditLogEntry["action"],
    details: String(r.details),
    actor: String(r.actor),
    timestamp: String(r.timestamp),
  }));
}

export async function createSuggestion(suggestion: Partial<EventSuggestion>): Promise<EventSuggestion> {
  const id = `sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const pool = getPgPool();
  if (pool) {
    await pool.query(
      "INSERT INTO suggestions (id, event_url, event_name, organizer, notes, submitter_email, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)",
      [
        id,
        suggestion.event_url || "",
        suggestion.event_name || null,
        suggestion.organizer || null,
        suggestion.notes || null,
        suggestion.submitter_email || null,
        now,
      ]
    );
  } else {
    const db = getSqliteDb();
    db.prepare(`
      INSERT INTO suggestions (id, event_url, event_name, organizer, notes, submitter_email, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      id,
      suggestion.event_url || "",
      suggestion.event_name || null,
      suggestion.organizer || null,
      suggestion.notes || null,
      suggestion.submitter_email || null,
      now
    );
  }

  return {
    id,
    event_url: suggestion.event_url || "",
    event_name: suggestion.event_name || null,
    organizer: suggestion.organizer || null,
    notes: suggestion.notes || null,
    submitter_email: suggestion.submitter_email || null,
    status: "pending",
    created_at: now,
  };
}

export async function getAllSuggestions(): Promise<EventSuggestion[]> {
  const pool = getPgPool();
  if (pool) {
    const res = await pool.query("SELECT * FROM suggestions ORDER BY created_at DESC");
    return res.rows.map((r) => ({
      id: String(r.id),
      event_url: String(r.event_url),
      event_name: r.event_name ? String(r.event_name) : null,
      organizer: r.organizer ? String(r.organizer) : null,
      notes: r.notes ? String(r.notes) : null,
      submitter_email: r.submitter_email ? String(r.submitter_email) : null,
      status: r.status as EventSuggestion["status"],
      created_at: String(r.created_at),
    }));
  }

  const db = getSqliteDb();
  const rows = db.prepare("SELECT * FROM suggestions ORDER BY created_at DESC").all() as Record<
    string,
    unknown
  >[];
  return rows.map((r) => ({
    id: String(r.id),
    event_url: String(r.event_url),
    event_name: r.event_name ? String(r.event_name) : null,
    organizer: r.organizer ? String(r.organizer) : null,
    notes: r.notes ? String(r.notes) : null,
    submitter_email: r.submitter_email ? String(r.submitter_email) : null,
    status: r.status as EventSuggestion["status"],
    created_at: String(r.created_at),
  }));
}

export async function reviewSuggestion(id: string, status: "approved" | "rejected"): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    await pool.query("UPDATE suggestions SET status = $1 WHERE id = $2", [status, id]);
    return true;
  }

  const db = getSqliteDb();
  db.prepare("UPDATE suggestions SET status = ? WHERE id = ?").run(status, id);
  return true;
}

export async function getMetrics() {
  const pool = getPgPool();
  if (pool) {
    try {
      const totalEvents = parseInt((await pool.query("SELECT COUNT(*) as c FROM events")).rows[0].c, 10);
      const publishedEvents = parseInt(
        (await pool.query("SELECT COUNT(*) as c FROM events WHERE publication_status = 'published'")).rows[0].c,
        10
      );
      const pendingReview = parseInt(
        (await pool.query("SELECT COUNT(*) as c FROM events WHERE publication_status = 'pending_review'")).rows[0].c,
        10
      );
      const openRegistrations = parseInt(
        (
          await pool.query(
            "SELECT COUNT(*) as c FROM events WHERE registration_status = 'open' AND publication_status = 'published'"
          )
        ).rows[0].c,
        10
      );
      const bothPerksConfirmed = parseInt(
        (
          await pool.query(`
            SELECT COUNT(*) as c FROM events
            WHERE publication_status = 'published'
            AND (goodies_status = 'confirmed' OR goodies_status = 'limited')
            AND (certificate_status = 'confirmed' OR certificate_status = 'conditional')
          `)
        ).rows[0].c,
        10
      );
      const pendingSuggestions = parseInt(
        (await pool.query("SELECT COUNT(*) as c FROM suggestions WHERE status = 'pending'")).rows[0].c,
        10
      );

      return {
        totalEvents,
        publishedEvents,
        pendingReview,
        openRegistrations,
        bothPerksConfirmed,
        pendingSuggestions,
      };
    } catch (err: unknown) {
      console.warn("PostgreSQL getMetrics warning (falling back):", err instanceof Error ? err.message : err);
    }
  }

  try {
    const db = getSqliteDb();
    const totalEvents = (db.prepare("SELECT COUNT(*) as c FROM events").get() as { c: number }).c;
    const publishedEvents = (
      db.prepare("SELECT COUNT(*) as c FROM events WHERE publication_status = 'published'").get() as { c: number }
    ).c;
    const pendingReview = (
      db.prepare("SELECT COUNT(*) as c FROM events WHERE publication_status = 'pending_review'").get() as { c: number }
    ).c;
    const openRegistrations = (
      db
        .prepare(
          "SELECT COUNT(*) as c FROM events WHERE registration_status = 'open' AND publication_status = 'published'"
        )
        .get() as { c: number }
    ).c;
    const bothPerksConfirmed = (
      db
        .prepare(`
          SELECT COUNT(*) as c FROM events
          WHERE publication_status = 'published'
          AND (goodies_status = 'confirmed' OR goodies_status = 'limited')
          AND (certificate_status = 'confirmed' OR certificate_status = 'conditional')
        `)
        .get() as { c: number }
    ).c;
    const pendingSuggestions = (
      db.prepare("SELECT COUNT(*) as c FROM suggestions WHERE status = 'pending'").get() as { c: number }
    ).c;

    return {
      totalEvents,
      publishedEvents,
      pendingReview,
      openRegistrations,
      bothPerksConfirmed,
      pendingSuggestions,
    };
  } catch {
    return {
      totalEvents: SEED_EVENTS.length,
      publishedEvents: SEED_EVENTS.length,
      pendingReview: 0,
      openRegistrations: SEED_EVENTS.filter((e) => e.registration_status === "open").length,
      bothPerksConfirmed: SEED_EVENTS.filter(
        (e) =>
          (e.goodies_status === "confirmed" || e.goodies_status === "limited") &&
          (e.certificate_status === "confirmed" || e.certificate_status === "conditional")
      ).length,
      pendingSuggestions: 0,
    };
  }
}
