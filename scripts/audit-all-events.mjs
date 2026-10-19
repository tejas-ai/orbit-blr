import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^DATABASE_URL=(.*)$/);
    if (match) {
      dbUrl = match[1].trim().replace(/^["']|["']$/g, "");
      break;
    }
  }
}

if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function audit() {
  const res = await pool.query("SELECT * FROM events ORDER BY start_at ASC");
  console.log(`Auditing ${res.rows.length} total events in Neon PostgreSQL:\n`);

  for (const row of res.rows) {
    console.log(`[${row.id}] ${row.name}`);
    console.log(`  Organizer: ${row.organizer}`);
    console.log(`  Category: ${row.category} | Area: ${row.area}`);
    console.log(`  Start: ${row.start_at} | Status: ${row.registration_status} | Free: ${row.is_free}`);
    console.log(`  Goodies: ${row.goodies_status} (${row.goodies_details || "none"})`);
    console.log(`  Certificate: ${row.certificate_status} (${row.certificate_requirements || "none"})`);
    console.log(`  Food: ${row.food_status} (${row.food_details || "none"})`);
    console.log(`  Source URLs: ${JSON.stringify(row.source_urls)}`);
    console.log(`  Pub Status: ${row.publication_status}`);
    console.log(`  Verification Notes: ${row.verification_notes}`);
    console.log("--------------------------------------------------------------------------------");
  }

  await pool.end();
}

audit().catch(console.error);
