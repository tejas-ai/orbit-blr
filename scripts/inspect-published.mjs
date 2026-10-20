import pg from "pg";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf-8");
const match = env.match(/DATABASE_URL=(.*)/);
if (!match) process.exit(1);

const pool = new pg.Pool({
  connectionString: match[1].trim().replace(/^["']|["']$/g, ""),
  ssl: { rejectUnauthorized: false },
});

try {
  const res = await pool.query(`
    SELECT id, slug, name, category, organizer, start_at, venue, area, registration_url, registration_status, publication_status
    FROM events
    WHERE publication_status = 'published'
    ORDER BY start_at ASC;
  `);
  console.log(`Found ${res.rows.length} published events:`);
  for (const ev of res.rows) {
    console.log(`\nID: ${ev.id}`);
    console.log(`Name: ${ev.name}`);
    console.log(`Category: ${ev.category}`);
    console.log(`Date: ${ev.start_at}`);
    console.log(`Venue: ${ev.venue} (${ev.area})`);
    console.log(`Reg URL: ${ev.registration_url}`);
    console.log(`Status: ${ev.registration_status}`);
  }
} catch (e) {
  console.error(e);
} finally {
  await pool.end();
}
