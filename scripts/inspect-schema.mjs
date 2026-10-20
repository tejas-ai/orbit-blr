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
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'events'
    ORDER BY ordinal_position;
  `);
  console.log("Existing columns in PostgreSQL 'events' table:");
  for (const col of res.rows) {
    console.log(`- ${col.column_name} (${col.data_type})`);
  }
} catch (e) {
  console.error("Error inspecting schema:", e);
} finally {
  await pool.end();
}
