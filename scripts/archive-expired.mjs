import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

// Read .env.local if present
const envPath = path.join(process.cwd(), ".env.local");
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  if (match) {
    dbUrl = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

if (!dbUrl) {
  console.error("❌ DATABASE_URL is missing.");
  process.exit(1);
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log("================================================================================");
  console.log("ORBIT BLR — AUTOMATIC EXPIRED EVENT ARCHIVAL ENGINE");
  console.log("Neon Project: broad-tooth-55681211");
  console.log("================================================================================\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Query published events where scheduled end_at is in the past
    const expiredRes = await client.query(`
      SELECT id, slug, name, end_at, publication_status 
      FROM events 
      WHERE publication_status = 'published' 
        AND end_at < NOW() 
      ORDER BY end_at ASC
      FOR UPDATE;
    `);

    const expiredRows = expiredRes.rows;
    console.log(`Found ${expiredRows.length} published event(s) past scheduled end_at.`);

    if (expiredRows.length > 0) {
      const updateQuery = `
        UPDATE events 
        SET 
          publication_status = 'archived',
          updated_at = NOW(),
          verification_notes = COALESCE(verification_notes, '') || E'\n[Auto-Archived] Event scheduled end_at has passed on ' || NOW()::text
        WHERE id = $1 AND publication_status = 'published';
      `;

      for (const row of expiredRows) {
        await client.query(updateQuery, [row.id]);
        console.log(`  Archived: [${row.id}] ${row.name} (ended: ${new Date(row.end_at).toISOString()})`);
      }
    } else {
      console.log("  All active published events are currently future-dated or ongoing.");
    }

    await client.query("COMMIT");

    // Readback verification
    const countRes = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE publication_status = 'published') as published_count,
        COUNT(*) FILTER (WHERE publication_status = 'archived') as archived_count,
        COUNT(*) FILTER (WHERE publication_status = 'pending_review') as pending_count,
        COUNT(*) as total_count
      FROM events;
    `);

    console.log("\n--- Database Post-Archival Summary ---");
    console.log("Active Published Events:", countRes.rows[0].published_count);
    console.log("Archived Events:        ", countRes.rows[0].archived_count);
    console.log("Pending Review Events:  ", countRes.rows[0].pending_count);
    console.log("Total Database Records: ", countRes.rows[0].total_count);
    console.log("================================================================================\n");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Archival error:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
