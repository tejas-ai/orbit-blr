/**
 * Read-only thumbnail QA for published ORBIT BLR events.
 * External organizer CDNs may reject bot HEAD/GET requests even when an
 * image renders in a browser. Treat these as unverified, not proof of failure.
 */
const base = process.env.ORBIT_BASE_URL || "https://orbit-blr.vercel.app";
const response = await fetch(base + "/api/events", { signal: AbortSignal.timeout(16000) });
if (!response.ok) throw new Error("Event API unavailable: HTTP " + response.status);
const json = await response.json();
if (!Array.isArray(json.events)) throw new Error("Invalid event payload");
const fallback = {
  Hackathons: "hackathons",
  "AI & ML": "ai-ml",
  Cloud: "cloud",
  Cybersecurity: "cybersecurity",
  Developer: "developer",
  "Data Science": "data-science",
  Robotics: "robotics",
  "Quantum Computing": "quantum",
  Startup: "startup",
  Networking: "networking",
  Workshops: "workshops",
};
let missing = 0, externalChecked = 0, unverified = 0;
const failures = [];
for (const e of json.events) {
  const usesOfficial = !!(e.thumbnail_url && e.thumbnail_verification_status === "verified");
  const isHack = e.category === "Hackathons" || /hackathon/i.test(e.name || "");
  const category = isHack ? "Hackathons" : e.category;
  const url = usesOfficial ? e.thumbnail_url : new URL("/thumbnails/" + (fallback[category] || "developer") + ".svg", base).href;
  if (!usesOfficial) missing++;
  try {
    // Browser-like normal GET: some CDNs block HEAD; do not infer broken from CORS.
    const image = await fetch(url, {
      headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
      signal: AbortSignal.timeout(10000),
    });
    const mime = image.headers.get("content-type") || "";
    await image.body?.cancel();
    if (image.ok && mime.startsWith("image/")) {
      if (usesOfficial) externalChecked++;
    } else if (usesOfficial) {
      unverified++;
      console.warn("UNVERIFIED official image (requires browser confirmation):", e.slug, image.status, mime);
    } else failures.push("Missing or invalid local fallback for " + e.slug + ": " + image.status);
  } catch (err) {
    if (usesOfficial) { unverified++; console.warn("UNVERIFIED official image:", e.slug, err.message); }
    else failures.push("Local fallback unreachable for " + e.slug + ": " + err.message);
  }
}
console.log(JSON.stringify({ published: json.events.length, missingEventSpecificArtwork: missing, workingOfficialImages: externalChecked, officialImagesRequiringBrowserCheck: unverified }, null, 2));
if (failures.length) {
  failures.forEach(f => console.error("BROKEN FALLBACK:", f));
  process.exitCode = 1;
}
// A missing custom banner is not a broken card if the category fallback renders.
// AI generation requires a separately configured image provider and durable storage.
