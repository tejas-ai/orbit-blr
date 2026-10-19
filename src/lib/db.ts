import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { OrbitEvent, EventSuggestion, AuditLogEntry, EventFilters, PublicationStatus } from "@/types/event";
import { SEED_EVENTS } from "./seed-data";

// Interface for global singleton in Next.js development
const globalForDb = globalThis as unknown as {
  orbitDbInstance?: DatabaseSync;
};

function getDatabase(): DatabaseSync {
  if (globalForDb.orbitDbInstance) {
    return globalForDb.orbitDbInstance;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "orbit.db");
  const db = new DatabaseSync(dbPath);

  // Initialize Schema
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

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      preferences TEXT NOT NULL DEFAULT 'all',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_area ON events(area);
    CREATE INDEX IF NOT EXISTS idx_events_reg_status ON events(registration_status);
    CREATE INDEX IF NOT EXISTS idx_events_pub_status ON events(publication_status);
  `);

  // Check if events table is empty; if so, populate with authentic seed data
  const countRow = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
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

    for (const evt of SEED_EVENTS) {
      insertStmt.run(
        evt.id,
        evt.slug,
        evt.name,
        evt.category,
        evt.organizer,
        evt.description,
        evt.start_at,
        evt.end_at,
        evt.timezone || "Asia/Kolkata",
        evt.venue,
        evt.venue_type || null,
        evt.area,
        evt.address || null,
        evt.landmark || null,
        evt.metro_station || null,
        evt.map_url || null,
        evt.is_in_person ? 1 : 0,
        evt.is_free ? 1 : 0,
        evt.registration_url,
        evt.registration_status,
        evt.approval_required ? 1 : 0,
        evt.goodies_status,
        evt.goodies_details || null,
        evt.certificate_status,
        evt.certificate_format || null,
        evt.certificate_requirements || null,
        evt.food_status,
        evt.food_details || null,
        JSON.stringify(evt.source_urls || []),
        evt.verification_notes || null,
        evt.last_verified_at || null,
        evt.publication_status,
        JSON.stringify(evt.who_should_attend || []),
        JSON.stringify(evt.topics_covered || []),
        evt.prerequisites || null,
        JSON.stringify(evt.agenda || []),
        evt.featured ? 1 : 0,
        evt.created_at,
        evt.updated_at
      );
    }
  }

  globalForDb.orbitDbInstance = db;
  return db;
}

// Convert SQLite row back to typed OrbitEvent
function mapRowToEvent(row: Record<string, unknown>): OrbitEvent {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: row.category as OrbitEvent["category"],
    organizer: String(row.organizer),
    description: String(row.description),
    start_at: String(row.start_at),
    end_at: String(row.end_at),
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
    source_urls: row.source_urls ? JSON.parse(String(row.source_urls)) : [],
    verification_notes: row.verification_notes ? String(row.verification_notes) : null,
    last_verified_at: row.last_verified_at ? String(row.last_verified_at) : null,
    publication_status: row.publication_status as OrbitEvent["publication_status"],
    who_should_attend: row.who_should_attend ? JSON.parse(String(row.who_should_attend)) : undefined,
    topics_covered: row.topics_covered ? JSON.parse(String(row.topics_covered)) : undefined,
    prerequisites: row.prerequisites ? String(row.prerequisites) : null,
    agenda: row.agenda ? JSON.parse(String(row.agenda)) : undefined,
    featured: Boolean(row.featured),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function getAllEvents(options?: { includeUnpublished?: boolean }): OrbitEvent[] {
  const db = getDatabase();
  const query = options?.includeUnpublished
    ? "SELECT * FROM events ORDER BY start_at ASC"
    : "SELECT * FROM events WHERE publication_status = 'published' ORDER BY start_at ASC";

  const rows = db.prepare(query).all() as Record<string, unknown>[];
  return rows.map(mapRowToEvent);
}

export function getFilteredEvents(filters: EventFilters, options?: { includeUnpublished?: boolean }): OrbitEvent[] {
  let events = getAllEvents(options);

  if (filters.search && filters.search.trim() !== "") {
    const q = filters.search.toLowerCase().trim();
    events = events.filter((e) =>
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
    events = events.filter((e) => e.category === filters.category);
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
      events = events.filter(
        (e) => e.goodies_status === "confirmed" || e.goodies_status === "limited"
      );
    } else if (filters.benefits === "complimentary_food") {
      events = events.filter(
        (e) => e.food_status === "complimentary_meals_confirmed" || e.food_status === "refreshments_confirmed"
      );
    }
  }

  if (filters.dateFilter && filters.dateFilter !== "all") {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    events = events.filter((e) => {
      const eventDateStr = e.start_at.split("T")[0];
      const eventDate = new Date(e.start_at);

      if (filters.dateFilter === "today") {
        return eventDateStr === todayStr;
      }
      if (filters.dateFilter === "tomorrow") {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return eventDateStr === tomorrow.toISOString().split("T")[0];
      }
      if (filters.dateFilter === "weekend") {
        const day = eventDate.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
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
    // Open registrations first, then approval required, waitlist, etc.
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
    // Both confirmed first
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

export function getEventBySlug(slug: string): OrbitEvent | null {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM events WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? mapRowToEvent(row) : null;
}

export function getEventById(id: string): OrbitEvent | null {
  const db = getDatabase();
  const row = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapRowToEvent(row) : null;
}

export function createEvent(data: Partial<OrbitEvent>, actor = "admin"): OrbitEvent {
  const db = getDatabase();
  const now = new Date().toISOString();
  const id = data.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const slug =
    data.slug ||
    (data.name || "event")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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

  // Log audit
  logAudit(id, "create", `Created event "${data.name}"`, actor);

  return getEventById(id)!;
}

export function updateEvent(id: string, data: Partial<OrbitEvent>, actor = "admin"): OrbitEvent | null {
  const db = getDatabase();
  const existing = getEventById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const merged: OrbitEvent = {
    ...existing,
    ...data,
    updated_at: now,
  };

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

  logAudit(id, "update", `Updated event fields: ${Object.keys(data).join(", ")}`, actor);
  return getEventById(id);
}

export function deleteEvent(id: string, actor = "admin"): boolean {
  const db = getDatabase();
  const existing = getEventById(id);
  if (!existing) return false;

  db.prepare("DELETE FROM events WHERE id = ?").run(id);
  logAudit(id, "update", `Deleted event "${existing.name}"`, actor);
  return true;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export function upsertEventsBatch(events: Partial<OrbitEvent>[], actor = "automation"): ImportResult {
  const db = getDatabase();
  const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

  for (const item of events) {
    try {
      if (!item.name || !item.registration_url) {
        result.skipped++;
        result.errors.push(`Skipped record without name or registration_url: ${JSON.stringify(item)}`);
        continue;
      }

      // Check duplicate by registration_url or id or slug
      let existing: Record<string, unknown> | undefined;
      if (item.id) {
        existing = db.prepare("SELECT * FROM events WHERE id = ?").get(item.id) as Record<string, unknown> | undefined;
      }
      if (!existing && item.registration_url) {
        existing = db.prepare("SELECT * FROM events WHERE registration_url = ?").get(item.registration_url) as Record<string, unknown> | undefined;
      }
      if (!existing && item.slug) {
        existing = db.prepare("SELECT * FROM events WHERE slug = ?").get(item.slug) as Record<string, unknown> | undefined;
      }

      if (existing) {
        updateEvent(String(existing.id), item, actor);
        result.updated++;
      } else {
        createEvent(item, actor);
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

export function logAudit(eventId: string, action: AuditLogEntry["action"], details: string, actor = "system") {
  try {
    const db = getDatabase();
    const id = `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO audit_logs (id, event_id, action, details, actor, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, eventId, action, details, actor, now);
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

export function getAuditLogs(limit = 50): AuditLogEntry[] {
  const db = getDatabase();
  const rows = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?").all(limit) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    event_id: String(r.event_id),
    action: r.action as AuditLogEntry["action"],
    details: String(r.details),
    actor: String(r.actor),
    timestamp: String(r.timestamp),
  }));
}

// Community Suggestions
export function createSuggestion(suggestion: Partial<EventSuggestion>): EventSuggestion {
  const db = getDatabase();
  const id = `sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

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

export function getAllSuggestions(): EventSuggestion[] {
  const db = getDatabase();
  const rows = db.prepare("SELECT * FROM suggestions ORDER BY created_at DESC").all() as Record<string, unknown>[];
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

export function reviewSuggestion(id: string, status: "approved" | "rejected"): boolean {
  const db = getDatabase();
  db.prepare("UPDATE suggestions SET status = ? WHERE id = ?").run(status, id);
  return true;
}

// Metrics for Admin Dashboard
export function getMetrics() {
  const db = getDatabase();
  const totalEvents = (db.prepare("SELECT COUNT(*) as c FROM events").get() as { c: number }).c;
  const publishedEvents = (db.prepare("SELECT COUNT(*) as c FROM events WHERE publication_status = 'published'").get() as { c: number }).c;
  const pendingReview = (db.prepare("SELECT COUNT(*) as c FROM events WHERE publication_status = 'pending_review'").get() as { c: number }).c;
  const openRegistrations = (db.prepare("SELECT COUNT(*) as c FROM events WHERE registration_status = 'open' AND publication_status = 'published'").get() as { c: number }).c;
  const bothPerksConfirmed = (db.prepare(`
    SELECT COUNT(*) as c FROM events
    WHERE publication_status = 'published'
    AND (goodies_status = 'confirmed' OR goodies_status = 'limited')
    AND (certificate_status = 'confirmed' OR certificate_status = 'conditional')
  `).get() as { c: number }).c;
  const pendingSuggestions = (db.prepare("SELECT COUNT(*) as c FROM suggestions WHERE status = 'pending'").get() as { c: number }).c;

  return {
    totalEvents,
    publishedEvents,
    pendingReview,
    openRegistrations,
    bothPerksConfirmed,
    pendingSuggestions,
  };
}
