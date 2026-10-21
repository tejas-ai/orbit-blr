import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { fileURLToPath } from "node:url";

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

// Ingestion CLI Tool
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
ORBIT BLR — AI EVENT INGESTION RUNNER (Method A: Authorised Neon SQL)
Usage:
  node scripts/ingest-event.mjs <path-to-event.json> [--skip-link-check] [--actor <name>]

Options:
  --skip-link-check   Skip live HTTP verification of registration_url (for offline crawlers)
  --actor             Identifier of the AI assistant or ingestion service (default: ai-cli-runner)
    `);
    process.exit(0);
  }

  const filePath = args[0];
  const skipLinkCheck = args.includes("--skip-link-check");
  const actorIdx = args.indexOf("--actor");
  const actor = actorIdx !== -1 && args[actorIdx + 1] ? args[actorIdx + 1] : "ai-cli-runner";

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Input file not found: ${filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  let inputData;
  try {
    inputData = JSON.parse(fileContent);
  } catch (err) {
    console.error("❌ Failed to parse JSON input:", err.message);
    process.exit(1);
  }

  // Import dynamic TypeScript/ESM modules
  const { EventSubmissionSchema } = await import("../src/lib/ingestion-schema.ts");
  const { verifyRegistrationUrl } = await import("../src/lib/verification-engine.ts");
  const { ingestEvent } = await import("../src/lib/event-ingestion.ts");

  const events = Array.isArray(inputData) ? inputData : [inputData];
  console.log(`\n================================================================================`);
  console.log(`ORBIT BLR — INGESTING ${events.length} EVENT(S) TO PRODUCTION NEON POSTGRESQL`);
  console.log(`================================================================================\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < events.length; i++) {
    const rawEvent = events[i];
    console.log(`[${i + 1}/${events.length}] Processing: "${rawEvent.name || "Untitled"}"...`);

    // 1. Zod Schema Validation
    const validation = EventSubmissionSchema.safeParse(rawEvent);
    if (!validation.success) {
      console.error(`  ❌ Schema validation failed:`);
      for (const issue of validation.error.issues) {
        console.error(`     - ${issue.path.join(".")}: ${issue.message}`);
      }
      failCount++;
      continue;
    }

    const validatedEvent = validation.data;

    // 2. Link QA Check
    if (!skipLinkCheck) {
      console.log(`  🔍 Performing live registration link quality check on: ${validatedEvent.registration_url}...`);
      const linkCheck = await verifyRegistrationUrl(validatedEvent.registration_url, validatedEvent.name);
      if (!linkCheck.isValid) {
        console.error(`  ❌ Link QA failed: ${linkCheck.reason || "Invalid link"}`);
        failCount++;
        continue;
      }
      console.log(`  ✅ Link QA passed! (Status: ${linkCheck.statusCode || 200}, HTTPS verified)`);
    } else {
      console.log(`  ⚠️ Skipping live link check (--skip-link-check active)`);
    }

    // 3. Ingestion & Database Readback
    try {
      console.log(`  💾 Ingesting to Neon PostgreSQL with transactional deduplication...`);
      const result = await ingestEvent(validatedEvent, actor);

      if (!result.success) {
        console.warn(`  ⚠️ Ingestion skipped: ${result.notes || "Not published"}`);
        failCount++;
        continue;
      }

      console.log(`  ✅ Ingestion SUCCESS! Action: ${result.action.toUpperCase()}`);
      console.log(`     - Event ID:            ${result.eventId}`);
      console.log(`     - Slug:                ${result.slug}`);
      console.log(`     - Publication Status:  ${result.publicationStatus}`);
      console.log(`     - Readback Verified:   ${result.readbackVerified}`);
      console.log(`     - Public Detail Route: https://orbit-blr.vercel.app/events/${result.slug}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌ Ingestion error:`, err.message || err);
      failCount++;
    }
  }

  console.log(`\n================================================================================`);
  console.log(`SUMMARY: ${successCount} Ingested, ${failCount} Failed / Skipped.`);
  console.log(`================================================================================\n`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(console.error);
