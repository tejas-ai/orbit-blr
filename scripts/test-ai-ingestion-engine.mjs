import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import {
  EventSubmissionSchema,
  BatchEventSubmissionSchema,
} from "../src/lib/ingestion-schema.ts";
import {
  verifyRegistrationUrl,
  normalizeCanonicalUrl,
  calculateEventPriority,
} from "../src/lib/verification-engine.ts";
import { ingestEvent, generateSlug } from "../src/lib/event-ingestion.ts";
import { archiveExpiredEvents } from "../src/lib/event-archival.ts";

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

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function runTestSuite() {
  console.log("================================================================================");
  console.log("ORBIT BLR — AI EVENT INGESTION, VERIFICATION & AUTOMATION TEST SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`TEST: ${name}... `);
    try {
      await fn();
      console.log("✅ PASS");
      passed++;
    } catch (err) {
      console.log(`❌ FAIL`);
      console.error("  ", err.message || err);
      failed++;
    }
  }

  // 1. Ingestion Contract & Schema Validation Tests
  await test("Rejects submission missing required fields (name, description, etc.)", async () => {
    const invalid = { organizer: "Google", is_free: true };
    const res = EventSubmissionSchema.safeParse(invalid);
    assert.strictEqual(res.success, false);
    const fields = res.error.issues.map((i) => i.path[0]);
    assert.ok(fields.includes("name"));
    assert.ok(fields.includes("description"));
  });

  await test("Strictly rejects paid events (is_free === false)", async () => {
    const paidEvent = {
      name: "Paid AI Bootcamp 2026",
      category: "AI & ML",
      organizer: "Tech Corp",
      description: "Comprehensive bootcamp with deep hands-on sessions across Bengaluru.",
      start_at: "2026-11-20T10:00:00.000Z",
      end_at: "2026-11-20T17:00:00.000Z",
      venue: "Tech Park",
      area: "Whitefield",
      is_free: false, // VIOLATION
      registration_url: "https://example.com/register",
      source_urls: ["https://example.com/event"],
      verification_notes: "Organizer site confirms 5000 INR ticket.",
    };
    const res = EventSubmissionSchema.safeParse(paidEvent);
    assert.strictEqual(res.success, false);
    const isFreeIssue = res.error.issues.find((i) => i.path.includes("is_free"));
    assert.ok(isFreeIssue, "Must reject is_free === false");
  });

  await test("Strictly rejects non-HTTPS registration URLs", async () => {
    const insecureEvent = {
      name: "Insecure Meetup Bengaluru",
      category: "Developer",
      organizer: "Dev Community",
      description: "In-person developer meetup focusing on scalable system architectures.",
      start_at: "2026-11-20T10:00:00.000Z",
      end_at: "2026-11-20T17:00:00.000Z",
      venue: "Tech Park",
      area: "Indiranagar",
      is_free: true,
      registration_url: "http://insecure-site.com/rsvp", // VIOLATION
      source_urls: ["https://example.com/event"],
      verification_notes: "Organizer community post.",
    };
    const res = EventSubmissionSchema.safeParse(insecureEvent);
    assert.strictEqual(res.success, false);
    const regIssue = res.error.issues.find((i) => i.path.includes("registration_url"));
    assert.ok(regIssue, "Must reject non-HTTPS URLs");
  });

  await test("Strictly rejects non-Bengaluru areas", async () => {
    const mumbaiEvent = {
      name: "Mumbai Developer Summit",
      category: "Developer",
      organizer: "Mumbai Tech",
      description: "In-person developer meetup focusing on scalable architectures.",
      start_at: "2026-11-20T10:00:00.000Z",
      end_at: "2026-11-20T17:00:00.000Z",
      venue: "BKC Center",
      area: "Bandra Kurla Complex, Mumbai", // VIOLATION
      is_free: true,
      registration_url: "https://example.com/rsvp",
      source_urls: ["https://example.com/event"],
      verification_notes: "Organizer community post.",
    };
    const res = EventSubmissionSchema.safeParse(mumbaiEvent);
    assert.strictEqual(res.success, false);
    const areaIssue = res.error.issues.find((i) => i.path.includes("area"));
    assert.ok(areaIssue, "Must reject non-Bengaluru area");
  });

  await test("Rejects missing evidence (empty source_urls)", async () => {
    const noEvidence = {
      name: "Unverified Bengaluru Meetup",
      category: "Developer",
      organizer: "Ghost Community",
      description: "In-person developer meetup focusing on scalable architectures.",
      start_at: "2026-11-20T10:00:00.000Z",
      end_at: "2026-11-20T17:00:00.000Z",
      venue: "Tech Park",
      area: "Koramangala",
      is_free: true,
      registration_url: "https://example.com/rsvp",
      source_urls: [], // VIOLATION
      verification_notes: "Found on twitter but no link.",
    };
    const res = EventSubmissionSchema.safeParse(noEvidence);
    assert.strictEqual(res.success, false);
    const sourceIssue = res.error.issues.find((i) => i.path.includes("source_urls"));
    assert.ok(sourceIssue, "Must reject empty source_urls");
  });

  await test("Accepts fully validated hackathon with rich structured details", async () => {
    const validHackathon = {
      name: "DevForge Bengaluru AI Hackathon 2026",
      category: "Hackathons",
      organizer: "DevForge Community & Tech Hub",
      description: "36-hour offline AI hackathon in Bengaluru building real-world generative models.",
      start_at: "2026-12-05T03:30:00.000Z",
      end_at: "2026-12-06T12:30:00.000Z",
      timezone: "Asia/Kolkata",
      venue: "Bengaluru Tech Summit Grounds",
      area: "Koramangala",
      address: "80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka 560034",
      is_in_person: true,
      is_free: true,
      registration_url: "https://devforge.example.com/hackathon-blr-2026",
      registration_status: "open",
      approval_required: true,
      goodies_status: "confirmed",
      goodies_details: "Official hackathon t-shirt, stickers, and developer hardware kit.",
      certificate_status: "confirmed",
      certificate_format: "digital",
      food_status: "complimentary_meals_confirmed",
      food_details: "All meals and overnight refreshments provided for 36 hours.",
      hackathon_details: {
        team_size: "2–4 members",
        application_deadline: "2026-11-28T18:29:59.000Z",
        eligibility: "Open to all developers and college students",
        offline_bangalore_round: true,
        tracks: ["Generative AI", "Edge Computing", "Open Source Tooling"],
        prizes_details: "₹2,00,000 Total Prize Pool across top 3 teams",
      },
      source_urls: ["https://devforge.example.com/official-announcement"],
      verification_notes: "Verified against DevForge official portal. In-person Bangalore venue confirmed.",
      publication_status: "published",
    };
    const res = EventSubmissionSchema.safeParse(validHackathon);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.category, "Hackathons");
    assert.strictEqual(res.data.hackathon_details.team_size, "2–4 members");
  });

  // 2. Verification Engine & Link QA Tests
  await test("SSRF Protection blocks localhost and loopback targets", async () => {
    const loopback = await verifyRegistrationUrl("https://localhost:8080/admin/exploit");
    assert.strictEqual(loopback.isValid, false);
    assert.ok(loopback.reason?.includes("SSRF Protection"));

    const privateIp = await verifyRegistrationUrl("https://192.168.1.100/internal-event");
    assert.strictEqual(privateIp.isValid, false);
    assert.ok(privateIp.reason?.includes("SSRF Protection"));
  });

  await test("URL Normalization strips tracking parameters and trailing slashes", () => {
    const dirty = "https://luma.com/event-xyz/?utm_source=twitter&utm_medium=social&ref=partner#rsvp";
    const clean = normalizeCanonicalUrl(dirty);
    assert.strictEqual(clean, "https://luma.com/event-xyz");
  });

  await test("Event Prioritisation Engine correctly assigns Priority 1 to Swag+Cert events", () => {
    const priority1 = calculateEventPriority({
      goodies_status: "confirmed",
      certificate_status: "confirmed",
      category: "Developer",
    });
    assert.strictEqual(priority1, 1);

    const priority2 = calculateEventPriority({
      goodies_status: "confirmed",
      certificate_status: "not_provided",
      category: "Developer",
    });
    assert.strictEqual(priority2, 2);

    const priority3 = calculateEventPriority({
      goodies_status: "unverified",
      certificate_status: "unverified",
      category: "Hackathons",
    });
    assert.strictEqual(priority3, 3);
  });

  // 3. Database Ingestion, Deduplication & Readback Tests (in Neon Transaction)
  await test("Transactional Ingestion inserts record and verifies SQL readback", async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const testEventData = {
        name: `Automated Test Meetup ${Date.now()}`,
        category: "AI & ML",
        organizer: "Test AI Group",
        description: "Test event verifying transactional ingestion and readback in Neon PostgreSQL.",
        start_at: new Date(Date.now() + 86400000).toISOString(),
        end_at: new Date(Date.now() + 90000000).toISOString(),
        timezone: "Asia/Kolkata",
        venue: "Indiranagar Test Hall",
        area: "Indiranagar",
        is_in_person: true,
        is_free: true,
        registration_url: `https://test-example.com/event-${Date.now()}`,
        registration_status: "open",
        approval_required: false,
        goodies_status: "confirmed",
        goodies_details: "Official developer swag t-shirt and sticker pack.",
        certificate_status: "confirmed",
        food_status: "refreshments_confirmed",
        food_details: "Evening tea, coffee and hot snacks.",
        source_urls: ["https://test-example.com/source"],
        verification_notes: "Automated test provenance note with confirmed swag kit and food.",
        publication_status: "published",
        verified_by: "test-suite",
        forceVerifiedWithEvidence: false,
      };

      const result = await ingestEvent(testEventData, "test-suite");
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.readbackVerified, true);
      assert.strictEqual(result.publicationStatus, "published");
      assert.ok(result.eventId.startsWith("evt-"));

      // Deduplication check: Ingesting the same event updates instead of duplicating
      const dedupResult = await ingestEvent(
        { ...testEventData, description: "Updated description via dedup check" },
        "test-suite"
      );
      assert.strictEqual(dedupResult.action, "updated");
      assert.strictEqual(dedupResult.eventId, result.eventId);
      assert.strictEqual(dedupResult.readbackVerified, true);

      // Clean up test event immediately
      await client.query("DELETE FROM events WHERE id = $1", [result.eventId]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  });

  // 4. Protection of 10 Discredited Seed Events
  await test("Protected 2026 seed records remain protected from unverified republication", async () => {
    const seedAttempt = {
      name: "Discredited Seed Re-publish Attempt",
      category: "Developer",
      organizer: "Unverified Organizer",
      description: "Attempting to publish discredited seed event without force flag.",
      start_at: "2026-11-20T10:00:00.000Z",
      end_at: "2026-11-20T17:00:00.000Z",
      venue: "TBA",
      area: "Koramangala",
      is_free: true,
      registration_url: "https://example.com/unverified-seed",
      source_urls: ["https://example.com"],
      verification_notes: "Unverified test attempt.",
      publication_status: "published",
      forceVerifiedWithEvidence: false, // Protected seed guard MUST trigger
    };

    // Simulate match against seed id 'evt-seed-1'
    const client = await pool.connect();
    try {
      const checkSeed = await client.query("SELECT id FROM events WHERE id = 'evt-seed-1'");
      if (checkSeed.rows.length > 0) {
        // Attempt ingest matching existing registration_url of evt-seed-1
        const seedUrlRes = await client.query("SELECT registration_url FROM events WHERE id = 'evt-seed-1'");
        if (seedUrlRes.rows[0]?.registration_url) {
          const res = await ingestEvent({
            ...seedAttempt,
            registration_url: seedUrlRes.rows[0].registration_url,
          });
          assert.strictEqual(res.success, false);
          assert.strictEqual(res.action, "skipped");
          assert.strictEqual(res.publicationStatus, "pending_review");
        }
      }
    } finally {
      client.release();
    }
  });

  // 5. Automatic Expired-Event Archival
  await test("Automatic archival evaluates PostgreSQL NOW() and preserves records", async () => {
    const report = await archiveExpiredEvents("test-suite");
    assert.ok(typeof report.archivedCount === "number");
    assert.ok(typeof report.activePublishedCount === "number");
    assert.ok(typeof report.totalEventsInDb === "number");
    assert.strictEqual(report.totalEventsInDb >= report.activePublishedCount, true);
  });

  // 6. Security & 404 Verifications
  await test("Retired admin routes continue to return HTTP 404 on production", async () => {
    const resAdmin = await fetch("https://orbit-blr.vercel.app/admin");
    assert.strictEqual(resAdmin.status, 404, "/admin must return 404");

    const resAdminApi = await fetch("https://orbit-blr.vercel.app/api/admin/events");
    assert.strictEqual(resAdminApi.status, 404, "/api/admin/events must return 404");
  });

  // 7. Unverified Organiser Claims & Date Defense
  await test("Unverified organiser perk claims are sanitized to unverified", async () => {
    const testUnverifiedPerks = {
      name: `Unverified Claims Test ${Date.now()}`,
      category: "Developer",
      organizer: "Hype Meetups",
      description: "Meetup claiming goodies and meals with zero concrete details or evidence.",
      start_at: new Date(Date.now() + 86400000).toISOString(),
      end_at: new Date(Date.now() + 90000000).toISOString(),
      timezone: "Asia/Kolkata",
      venue: "HSR Coworking",
      area: "HSR Layout",
      is_in_person: true,
      is_free: true,
      registration_url: `https://test-claims.com/event-${Date.now()}`,
      registration_status: "open",
      approval_required: false,
      goodies_status: "confirmed", // Claimed but no details or notes evidence
      food_status: "complimentary_meals_confirmed", // Claimed but no details or notes evidence
      source_urls: ["https://test-claims.com/event/meetup-1"],
      verification_notes: "Organizer says it will be fun.", // No evidence of swag or food
      publication_status: "published",
      verified_by: "test-suite",
      forceVerifiedWithEvidence: false,
    };

    const res = await ingestEvent(testUnverifiedPerks, "test-suite");
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.event.goodies_status, "unverified", "Goodies must be sanitized to unverified");
    assert.strictEqual(res.event.food_status, "unverified", "Food must be sanitized to unverified");

    // Clean up
    await pool.query("DELETE FROM events WHERE id = $1", [res.eventId]);
  });

  await test("Rejects published events whose end date has already passed", async () => {
    const expiredEvent = {
      name: "Past Expired Event",
      category: "Developer",
      organizer: "Past Tech",
      description: "An event that has already ended.",
      start_at: "2024-01-01T10:00:00.000Z",
      end_at: "2024-01-01T17:00:00.000Z",
      venue: "Tech Park",
      area: "Whitefield",
      is_free: true,
      registration_url: "https://example.com/event/past-1",
      source_urls: ["https://example.com/event/past-1"],
      verification_notes: "Historical event listing.",
      publication_status: "published", // VIOLATION: Cannot publish past event
    };
    const res = EventSubmissionSchema.safeParse(expiredEvent);
    assert.strictEqual(res.success, false);
    const dateIssue = res.error.issues.find((i) => i.path.includes("end_at"));
    assert.ok(dateIssue, "Must reject past end date for published events");
  });

  await pool.end();

  console.log("\n================================================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("FATAL TEST SUITE ERROR:", err);
  process.exit(1);
});
