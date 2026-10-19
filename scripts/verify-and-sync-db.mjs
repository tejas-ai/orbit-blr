import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
  console.error("❌ DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function verifyAndSync() {
  console.log("🔍 Testing database connection...");
  try {
    const timeRes = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully! Server time:", timeRes.rows[0].now);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }

  // Check if events table exists
  const tableCheck = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events'"
  );

  if (tableCheck.rows.length === 0) {
    console.log("📦 Events table not found. Applying schema migrations from schema.sql...");
    const schemaSql = fs.readFileSync(path.join(process.cwd(), "schema.sql"), "utf-8");
    await pool.query(schemaSql);
    console.log("✅ Schema migration applied successfully.");
  } else {
    console.log("✅ Events table exists.");
  }

  // Check count of events
  const countRes = await pool.query("SELECT COUNT(*) FROM events");
  const count = parseInt(countRes.rows[0].count, 10);
  console.log(`📊 Current events in database: ${count}`);

  if (count === 0) {
    console.log("🌱 Database is empty. Seeding 10 audited genuine Bengaluru tech events...");
    // Import seed-cloud-db logic
    const seedScript = await import("./seed-cloud-db.mjs");
    console.log("✅ Seeding complete.");
  }

  const finalCountRes = await pool.query("SELECT COUNT(*) FROM events");
  console.log(`🎉 Verified database storage: ${finalCountRes.rows[0].count} events ready.`);

  await pool.end();
}

verifyAndSync().catch(console.error);
