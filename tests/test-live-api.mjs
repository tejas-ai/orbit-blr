import fs from "node:fs";
import path from "node:path";

// Dynamically load environment variables from .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const BASE = process.env.TEST_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SECRET = process.env.ORBIT_API_SECRET;
const ADMIN_PWD = process.env.ORBIT_ADMIN_PASSWORD;

if (!SECRET || !ADMIN_PWD) {
  console.error("Missing ORBIT_API_SECRET or ORBIT_ADMIN_PASSWORD in environment.");
  process.exit(1);
}

async function runTests() {
  console.log("==================================================");
  console.log("       ORBIT BLR - LIVE HTTP API TEST SUITE       ");
  console.log("==================================================");

  // Test 1: Public Events Listing
  const res1 = await fetch(`${BASE}/api/events`);
  const data1 = await res1.json();
  console.log(`✅ Test 1: GET /api/events returned HTTP ${res1.status}, count = ${data1.count}`);
  if (!res1.ok || data1.count < 10) throw new Error("Failed Test 1");

  // Test 2: Filtered Events
  const res2 = await fetch(`${BASE}/api/events?category=${encodeURIComponent("AI & ML")}`);
  const data2 = await res2.json();
  console.log(`✅ Test 2: GET /api/events?category=AI & ML returned count = ${data2.count}`);
  if (!res2.ok || data2.count === 0) throw new Error("Failed Test 2");

  // Test 3: Public Suggestion
  const res3 = await fetch(`${BASE}/api/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_url: "https://lu.ma/test-blr-tech-meetup",
      event_name: "Test Community Meetup Bengaluru",
      organizer: "Bangalore Indie Hackers",
      notes: "Free pizza and stickers confirmed by organizer",
      submitter_email: "test@example.com",
    }),
  });
  const data3 = await res3.json();
  console.log(`✅ Test 3: POST /api/suggest returned HTTP ${res3.status}, message: ${data3.message}`);
  if (!res3.ok) throw new Error("Failed Test 3");

  // Test 4: Unauthorized Import Request
  const res4 = await fetch(`${BASE}/api/admin/events/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: [] }),
  });
  console.log(`✅ Test 4: POST /api/admin/events/import without token returned HTTP ${res4.status} (Expected 401)`);
  if (res4.status !== 401) throw new Error("Failed Test 4: Should be 401 Unauthorized");

  // Test 5: Authorized Import with Bearer Token (Upsert & Deduplication)
  const res5 = await fetch(`${BASE}/api/admin/events/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SECRET}`,
    },
    body: JSON.stringify({
      events: [
        // 1 new event
        {
          id: "evt-test-new-meetup",
          slug: "bengaluru-rust-systems-hacknight",
          name: "Bengaluru Rust Systems Hacknight",
          category: "Developer",
          organizer: "Rust Bangalore",
          description: "Hands-on systems programming in Rust: async runtime and memory models.",
          start_at: "2026-11-20T18:00:00+05:30",
          end_at: "2026-11-20T21:00:00+05:30",
          venue: "HasGeek House, Indiranagar",
          area: "Indiranagar",
          registration_url: "https://hasgeek.com/events/rust-blr-hacknight",
          registration_status: "open",
          goodies_status: "confirmed",
          goodies_details: "Ferris the Crab vinyl stickers",
          certificate_status: "not_provided",
          food_status: "refreshments_confirmed",
          food_details: "Filter coffee and evening snacks",
          publication_status: "published",
        },
        // 1 existing event (update)
        {
          slug: "gdg-bengaluru-gemini-vertex-ai-summit",
          name: "GDG Bengaluru: Building Production GenAI with Gemini 1.5 & Vertex AI",
          registration_url: "https://gdg.community.dev/events/details/developer-group-bangalore-presents-genai-production-summit/",
          verification_notes: "Updated by external automated ChatGPT verification engine on 19 Oct 2026.",
        },
      ],
    }),
  });
  const data5 = await res5.json();
  console.log(
    `✅ Test 5: POST /api/admin/events/import with Bearer token returned HTTP ${res5.status}: Created=${data5.created}, Updated=${data5.updated}, Skipped=${data5.skipped}`
  );
  if (!res5.ok || data5.created !== 1 || data5.updated !== 1) {
    throw new Error(`Failed Test 5: Expected 1 created and 1 updated, got ${JSON.stringify(data5)}`);
  }

  // Test 6: Admin Authentication
  const res6 = await fetch(`${BASE}/api/admin/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PWD }),
  });
  const data6 = await res6.json();
  console.log(`✅ Test 6: POST /api/admin/auth returned HTTP ${res6.status}, success = ${data6.success}`);
  if (!res6.ok || !data6.success) throw new Error("Failed Test 6");

  // Test 7: Verify Sitemap and Robots
  const resRobots = await fetch(`${BASE}/robots.txt`);
  const resSitemap = await fetch(`${BASE}/sitemap.xml`);
  console.log(`✅ Test 7: GET /robots.txt = HTTP ${resRobots.status}, GET /sitemap.xml = HTTP ${resSitemap.status}`);
  if (!resRobots.ok || !resSitemap.ok) throw new Error("Failed Test 7");

  console.log("==================================================");
  console.log("   🎉 ALL 7 LIVE API INTEGRATION TESTS PASSED!    ");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("❌ Test failure:", err);
  process.exit(1);
});
