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

async function clean() {
  const res = await pool.query(
    "DELETE FROM events WHERE id LIKE 'evt-test%' OR id LIKE 'evt-179239%' OR slug LIKE 'bengaluru-rust-systems%'"
  );
  console.log(`Deleted ${res.rowCount} test records from events table.`);
  const count = await pool.query("SELECT COUNT(*) FROM events");
  console.log(`Remaining verified genuine events in DB: ${count.rows[0].count}`);
  await pool.end();
}

clean().catch(console.error);
