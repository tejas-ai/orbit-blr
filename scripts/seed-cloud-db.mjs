import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const { Pool } = pg;

// Read .env.local
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ No DATABASE_URL found.");
  process.exit(1);
}

// Read the audited seed data directly from seed-data.ts by parsing JSON or using regex
const seedTsContent = readFileSync(join(process.cwd(), "src/lib/seed-data.ts"), "utf-8");
const jsonMatch = seedTsContent.match(/export const SEED_EVENTS: OrbitEvent\[\] = (\[[\s\S]*\]);/);
if (!jsonMatch) {
  console.error("❌ Could not parse SEED_EVENTS");
  process.exit(1);
}

// Convert TypeScript object notation to JSON
const validJson = jsonMatch[1]
  .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Quote keys
  .replace(/'/g, '"')                                 // Replace single quotes with double quotes
  .replace(/,\s*([}\]])/g, "$1");                     // Remove trailing commas

const seedEvents = eval(jsonMatch[1]); // Safe in local build tool

console.log(`Audited seed events count: ${seedEvents.length}`);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    // 1. Run migrations first
    const schemaSql = readFileSync(join(process.cwd(), "schema.sql"), "utf-8");
    await client.query(schemaSql);
    console.log("✅ Schema migrations applied.");

    // 2. Insert audited events
    const insertQuery = `
      INSERT INTO events (
        id, slug, name, category, organizer, description, start_at, end_at, timezone,
        venue, venue_type, area, address, landmark, metro_station, map_url,
        is_in_person, is_free, registration_url, registration_status, approval_required,
        goodies_status, goodies_details, certificate_status, certificate_format, certificate_requirements,
        food_status, food_details, source_urls, verification_notes, last_verified_at,
        publication_status, who_should_attend, topics_covered, prerequisites, agenda, featured,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        $27, $28, $29, $30, $31,
        $32, $33, $34, $35, $36, $37,
        $38, $39
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        organizer = EXCLUDED.organizer,
        description = EXCLUDED.description,
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        venue = EXCLUDED.venue,
        venue_type = EXCLUDED.venue_type,
        area = EXCLUDED.area,
        address = EXCLUDED.address,
        landmark = EXCLUDED.landmark,
        metro_station = EXCLUDED.metro_station,
        map_url = EXCLUDED.map_url,
        is_in_person = EXCLUDED.is_in_person,
        is_free = EXCLUDED.is_free,
        registration_url = EXCLUDED.registration_url,
        registration_status = EXCLUDED.registration_status,
        approval_required = EXCLUDED.approval_required,
        goodies_status = EXCLUDED.goodies_status,
        goodies_details = EXCLUDED.goodies_details,
        certificate_status = EXCLUDED.certificate_status,
        certificate_format = EXCLUDED.certificate_format,
        certificate_requirements = EXCLUDED.certificate_requirements,
        food_status = EXCLUDED.food_status,
        food_details = EXCLUDED.food_details,
        source_urls = EXCLUDED.source_urls,
        verification_notes = EXCLUDED.verification_notes,
        last_verified_at = EXCLUDED.last_verified_at,
        publication_status = EXCLUDED.publication_status,
        who_should_attend = EXCLUDED.who_should_attend,
        topics_covered = EXCLUDED.topics_covered,
        prerequisites = EXCLUDED.prerequisites,
        agenda = EXCLUDED.agenda,
        featured = EXCLUDED.featured,
        updated_at = NOW();
    `;

    for (const evt of seedEvents) {
      await client.query(insertQuery, [
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
        Boolean(evt.is_in_person),
        Boolean(evt.is_free),
        evt.registration_url,
        evt.registration_status,
        Boolean(evt.approval_required),
        evt.goodies_status,
        evt.goodies_details || null,
        evt.certificate_status,
        evt.certificate_format || null,
        evt.certificate_requirements || null,
        evt.food_status,
        evt.food_details || null,
        JSON.stringify(evt.source_urls || []),
        evt.verification_notes || null,
        evt.last_verified_at || new Date().toISOString(),
        evt.publication_status,
        JSON.stringify(evt.who_should_attend || []),
        JSON.stringify(evt.topics_covered || []),
        evt.prerequisites || null,
        JSON.stringify(evt.agenda || []),
        Boolean(evt.featured),
        evt.created_at,
        evt.updated_at,
      ]);
    }

    // Enforce 100% zero-unverified policy: Move any published events to pending_review
    await client.query("UPDATE events SET publication_status = 'pending_review' WHERE publication_status = 'published'");

    const res = await client.query("SELECT COUNT(*) FROM events");
    const pubRes = await client.query("SELECT COUNT(*) FROM events WHERE publication_status = 'published'");
    const revRes = await client.query("SELECT COUNT(*) FROM events WHERE publication_status = 'pending_review'");
    console.log(`✅ PostgreSQL synced: ${res.rows[0].count} total events (${pubRes.rows[0].count} published, ${revRes.rows[0].count} in review queue).`);

    // Verify sample records
    const sample = await client.query("SELECT name, area, registration_url, goodies_status, certificate_status, publication_status FROM events LIMIT 3");
    console.log("Sample records from PostgreSQL review queue:");
    sample.rows.forEach(r => console.log(`   - [${r.area}] ${r.name} (Status: ${r.publication_status}, Goodies: ${r.goodies_status}, Cert: ${r.certificate_status})`));

  } finally {
    client.release();
    await pool.end();
  }
}

export { run };

// If executed directly
if (process.argv[1] && process.argv[1].endsWith("seed-cloud-db.mjs")) {
  run().catch((err) => {
    console.error("❌ Seed run failed:", err);
    process.exit(1);
  });
}

