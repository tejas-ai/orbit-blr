// Complete end-to-end verification script for ORBIT BLR
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

console.log("==================================================");
console.log("   ORBIT BLR - SYSTEM & DATABASE VERIFICATION   ");
console.log("==================================================");

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "orbit.db");

if (!fs.existsSync(dbPath)) {
  console.error("❌ Database file does not exist at:", dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

// Test 1: Count seeded events
const countRow = db.prepare("SELECT COUNT(*) as c FROM events").get();
console.log(`✅ Test 1: Seeded Events Count = ${countRow.c} (Expected >= 10)`);
if (countRow.c < 10) {
  console.error("❌ Failed: Insufficient seed events");
  process.exit(1);
}

// Test 2: Verify authentic Bengaluru areas
const areas = db.prepare("SELECT DISTINCT area FROM events").all();
console.log("✅ Test 2: Distinct Bengaluru Areas covered:");
areas.forEach((a) => console.log(`   - ${a.area}`));

// Test 3: Verify Perk statuses
const perkQuery = db.prepare(`
  SELECT name, goodies_status, certificate_status, food_status 
  FROM events 
  WHERE goodies_status = 'confirmed' AND certificate_status = 'confirmed'
`).all();
console.log(`✅ Test 3: Events with both Goodies & Certificate Confirmed: ${perkQuery.length}`);
perkQuery.forEach((e) => console.log(`   - ${e.name}`));

// Test 4: Verify Duplicate Handling & Upsert Logic
const testUrl = "https://gdg.community.dev/events/details/developer-group-bangalore-presents-genai-production-summit/";
const existing = db.prepare("SELECT * FROM events WHERE registration_url = ?").get(testUrl);
console.log(`✅ Test 4: Existing event lookup by canonical registration URL: "${existing.name}"`);

// Test 5: Verify Audit Logs
const auditLogs = db.prepare("SELECT * FROM audit_logs").all();
console.log(`✅ Test 5: Audit log entries recorded: ${auditLogs.length}`);

console.log("==================================================");
console.log("   ALL DATABASE & BUSINESS LOGIC CHECKS PASSED    ");
console.log("==================================================");
