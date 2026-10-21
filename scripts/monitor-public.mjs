/**
 * Read-only synthetic production health monitor.
 * Never authenticates, submits suggestions, or mutates event records.
 */
const origin = process.env.ORBIT_BASE_URL || "https://orbit-blr.vercel.app";
const faults = [];
const timeouts = 12000;
const requests = [
  ["/", 200],
  ["/explore", 200],
  ["/explore?category=Hackathons", 200],
  ["/about", 200],
  ["/suggest", 200],
  ["/saved", 200],
  ["/api/events", 200],
  ["/api/events?category=Hackathons", 200],
  ["/api/auth/providers", 200],
  ["/admin", 404],
  ["/api/admin", 404],
  ["/api/admin/events", 404],
  ["/api/user/saved-events", 401],
  ["/api/cron/events-maintenance", 401],
  ["/api/stats/users", 401],
  ["/robots.txt", 200],
  ["/sitemap.xml", 200],
];
const eventUrls = new Set();
for (const [path, expected] of requests) {
  try {
    const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(timeouts), headers: { "Cache-Control": "no-cache" } });
    if (response.status !== expected) {
      faults.push(`${path}: HTTP ${response.status}, expected ${expected}`);
    } else {
      console.log(`PASS ${expected} ${path}`);
      if (path === "/api/events") {
        const j = await response.json();
        if (j.success !== true || !Array.isArray(j.events)) faults.push("Public event API invalid JSON");
        else {
          if (j.count !== j.events.length) faults.push("Event count and array length differ");
          if (!j.events.length) faults.push("No published events in the public API: investigate DB sync");
          for (const e of j.events) {
            if (e.publication_status !== "published") faults.push("Nonpublished event exposed: " + e.slug);
            if (!e.slug || eventUrls.has(e.slug)) faults.push("Missing or duplicate published slug: " + e.slug);
            eventUrls.add(e.slug);
            if (!e.registration_url?.startsWith("https://")) faults.push("Insecure or missing event registration URL: " + e.slug);
          }
          console.log(`Published event count: ${j.events.length}`);
        }
      }
    }
  } catch (error) { faults.push(`${path}: ${error.message}`); }
}
if (faults.length) {
  for (const f of faults) console.error("HEALTH FAULT:", f);
  process.exitCode = 1;
} else console.log("ORBIT BLR production route and security smoke checks passed");
