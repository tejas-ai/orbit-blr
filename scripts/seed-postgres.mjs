import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";
import { SEED_EVENTS } from "../src/lib/seed-data.js";

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

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding PostgreSQL with audited, verified Bengaluru tech events...");

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
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        organizer = EXCLUDED.organizer,
        description = EXCLUDED.description,
        start_at = EXCLUDED.start_at,
        end_at = EXCLUDED.end_at,
        venue = EXCLUDED.venue,
        area = EXCLUDED.area,
        registration_url = EXCLUDED.registration_url,
        registration_status = EXCLUDED.registration_status,
        goodies_status = EXCLUDED.goodies_status,
        certificate_status = EXCLUDED.certificate_status,
        food_status = EXCLUDED.food_status,
        source_urls = EXCLUDED.source_urls,
        verification_notes = EXCLUDED.verification_notes,
        last_verified_at = EXCLUDED.last_verified_at,
        publication_status = EXCLUDED.publication_status,
        updated_at = NOW();
    `;

    for (const evt of SEED_EVENTS) {
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
        evt.is_in_person ? true : false,
        evt.is_free ? true : false,
        evt.registration_url,
        evt.registration_status,
        evt.approval_required ? true : false,
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
        evt.featured ? true : false,
        evt.created_at,
        evt.updated_at,
      ]);
    }

    const res = await client.query("SELECT COUNT(*) FROM events");
    console.log(`✅ Seeded ${res.rows[0].count} authentic events into PostgreSQL!`);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
