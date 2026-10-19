import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const seedTsContent = readFileSync(join(process.cwd(), "src/lib/seed-data.ts"), "utf-8");
const jsonMatch = seedTsContent.match(/export const SEED_EVENTS: OrbitEvent\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error("❌ Could not parse SEED_EVENTS");
  process.exit(1);
}
const SEED_EVENTS = eval(jsonMatch[1]);

const dbPath = join(process.cwd(), "data", "orbit.db");
const db = new DatabaseSync(dbPath);

console.log("Reseeding local SQLite database...");
db.exec("DELETE FROM events;");
db.exec("DELETE FROM suggestions;");
db.exec("DELETE FROM audit_logs;");

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

for (const event of SEED_EVENTS) {
  insertStmt.run(
    event.id,
    event.slug,
    event.name,
    event.category,
    event.organizer,
    event.description,
    event.start_at,
    event.end_at,
    event.timezone,
    event.venue,
    event.venue_type || null,
    event.area,
    event.address || null,
    event.landmark || null,
    event.metro_station || null,
    event.map_url || null,
    event.is_in_person ? 1 : 0,
    event.is_free ? 1 : 0,
    event.registration_url,
    event.registration_status,
    event.approval_required ? 1 : 0,
    event.goodies_status,
    event.goodies_details || null,
    event.certificate_status,
    event.certificate_format || null,
    event.certificate_requirements || null,
    event.food_status,
    event.food_details || null,
    JSON.stringify(event.source_urls || []),
    event.verification_notes || null,
    event.last_verified_at || null,
    event.publication_status,
    JSON.stringify(event.who_should_attend || []),
    JSON.stringify(event.topics_covered || []),
    event.prerequisites || null,
    JSON.stringify(event.agenda || []),
    event.featured ? 1 : 0,
    event.created_at,
    event.updated_at
  );
}

const count = db.prepare("SELECT COUNT(*) as c FROM events").get();
console.log(`✅ SQLite re-seeded: ${count.c} events now in local database.`);
db.close();
