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

  console.log("🌱 Syncing schema and verified event review queue with PostgreSQL...");
  const { run } = await import("./seed-cloud-db.mjs");
  await run();

  // Test persistent write and read
  console.log("✍️ Testing persistent database write and read access...");
  const testId = `test-verify-${Date.now()}`;
  await pool.query(
    "INSERT INTO suggestions (id, event_url, notes, status, created_at) VALUES ($1, $2, $3, $4, NOW())",
    [testId, "https://orbit-blr.vercel.app/test", "Persistence verification check", "pending"]
  );
  const verifyWrite = await pool.query("SELECT id FROM suggestions WHERE id = $1", [testId]);
  if (verifyWrite.rows.length === 1) {
    console.log("✅ Verified persistent PostgreSQL writes and reads!");
    await pool.query("DELETE FROM suggestions WHERE id = $1", [testId]);
  } else {
    throw new Error("Persistent write verification failed.");
  }

  const finalCountRes = await pool.query("SELECT COUNT(*) FROM events");
  const pubCountRes = await pool.query("SELECT COUNT(*) FROM events WHERE publication_status = 'published'");
  const revCountRes = await pool.query("SELECT COUNT(*) FROM events WHERE publication_status = 'pending_review'");
  console.log(`🎉 Verified database storage: ${finalCountRes.rows[0].count} total events (${pubCountRes.rows[0].count} published, ${revCountRes.rows[0].count} in review queue).`);

  await pool.end();
}

verifyAndSync().catch(console.error);
