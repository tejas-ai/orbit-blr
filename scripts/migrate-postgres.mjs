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
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[match[1].trim()] = val;
    }
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ No DATABASE_URL found in environment.");
  process.exit(1);
}

console.log("Connecting to production PostgreSQL database...");
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to cloud PostgreSQL database!");

    const schemaSql = readFileSync(join(process.cwd(), "schema.sql"), "utf-8");
    console.log("Running schema migrations...");
    await client.query(schemaSql);
    console.log("✅ Schema migration executed successfully!");

    // Check count of events
    const res = await client.query("SELECT COUNT(*) FROM events");
    console.log(`Current events in PostgreSQL: ${res.rows[0].count}`);

    client.release();
    await pool.end();
    console.log("✅ PostgreSQL migration and connectivity verified!");
  } catch (err) {
    console.error("❌ PostgreSQL migration failed:", err);
    process.exit(1);
  }
}

migrate();
