import pg from "pg";
import fs from "node:fs";

if (!fs.existsSync(".env.vercel.tmp")) {
  console.log("No .env.vercel.tmp");
  process.exit(1);
}

const lines = fs.readFileSync(".env.vercel.tmp", "utf-8").split("\n");
let dbUrl = "";
for (const line of lines) {
  if (line.startsWith("DATABASE_URL=")) {
    dbUrl = line.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
    break;
  }
}

if (!dbUrl) {
  console.log("No DATABASE_URL in .env.vercel.tmp");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
try {
  const r = await pool.query("SELECT NOW()");
  console.log("✅ Vercel DATABASE_URL connected successfully! Time:", r.rows[0].now);
  await pool.end();
} catch (err) {
  console.log("❌ Vercel DATABASE_URL connection failed:", err.message);
  await pool.end();
  process.exit(1);
}
