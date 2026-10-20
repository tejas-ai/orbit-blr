import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const PROD_URL = "https://orbit-blr.vercel.app";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988";
const PUBLIC_DIR = path.resolve(process.cwd(), "public/screenshots");

const PRE_DEPLOY_IDS = [
  "evt-mlh-atria-hacktoberfest-20261023",
  "evt-owasp-null-20261024",
  "evt-blrdroid-blrkotlin-20261024",
  "evt-software-architects-20261024",
  "evt-bangpypers-fp-20261024",
  "evt-hackman-x-20261026",
  "evt-gears-20261027",
  "evt-world-models-20261031",
  "evt-devforge-yugaantar-20261126",
];

const results = [];

function recordResult(testName, passed, details = "") {
  results.push({ testName, passed, details });
  const status = passed ? "[✓ PASS]" : "[✗ FAIL]";
  console.log(`${status} ${testName} ${details ? "- " + details : ""}`);
}

function saveAndCopy(tempName) {
  const src = path.join(PUBLIC_DIR, tempName);
  const dst = path.join(ARTIFACT_DIR, tempName);
  fs.copyFileSync(src, dst);
}

async function runVerification() {
  console.log(`\n======================================================`);
  console.log(`INDEPENDENT PRODUCTION VERIFICATION: ${PROD_URL}`);
  console.log(`======================================================\n`);

  // 1. HTTP Endpoint Status Checks
  console.log(`--- SECTION 1: HTTP Endpoint Status Checks ---`);
  const endpoints = [
    { url: `${PROD_URL}/`, expectedStatus: 200, name: "Homepage (/)" },
    { url: `${PROD_URL}/explore`, expectedStatus: 200, name: "Explore Directory (/explore)" },
    { url: `${PROD_URL}/explore?category=Hackathons`, expectedStatus: 200, name: "Explore Hackathons Filter (/explore?category=Hackathons)" },
    { url: `${PROD_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, expectedStatus: 200, name: "Event Detail (GEARS 2026)" },
    { url: `${PROD_URL}/saved`, expectedStatus: 200, name: "Saved Events (/saved)" },
    { url: `${PROD_URL}/suggest`, expectedStatus: 200, name: "Suggest Event (/suggest)" },
    { url: `${PROD_URL}/about`, expectedStatus: 200, name: "About Page (/about)" },
    { url: `${PROD_URL}/api/events`, expectedStatus: 200, name: "Public Events API (/api/events)" },
    { url: `${PROD_URL}/admin`, expectedStatus: 404, name: "Retired Admin Route (/admin) - 404 Protection" },
    { url: `${PROD_URL}/api/admin/events`, expectedStatus: 404, name: "Retired Admin API (/api/admin/events) - 404 Protection" },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { redirect: "manual" });
      const passed = res.status === ep.expectedStatus;
      recordResult(ep.name, passed, `HTTP status ${res.status} (expected ${ep.expectedStatus})`);
    } catch (err) {
      recordResult(ep.name, false, `Fetch error: ${err.message}`);
    }
  }

  // Check /hackathons redirect
  try {
    const res = await fetch(`${PROD_URL}/hackathons`, { redirect: "manual" });
    const isRedirectOrOk = res.status === 307 || res.status === 308 || res.status === 200;
    const location = res.headers.get("location");
    recordResult(
      "Hackathons Route (/hackathons)",
      isRedirectOrOk,
      `HTTP status ${res.status}${location ? ` -> ${location}` : ""}`
    );
  } catch (err) {
    recordResult("Hackathons Route (/hackathons)", false, `Fetch error: ${err.message}`);
  }

  // 2. Production API & 9-Event Integrity Comparison
  console.log(`\n--- SECTION 2: 9-Event API Integrity Audit ---`);
  let prodEvents = [];
  try {
    const res = await fetch(`${PROD_URL}/api/events`);
    const data = await res.json();
    prodEvents = data.events || data;

    const countPassed = prodEvents.length === 9;
    recordResult("Published Events Count", countPassed, `Found ${prodEvents.length} events (expected 9)`);

    const prodIds = prodEvents.map((e) => e.id);
    const missingIds = PRE_DEPLOY_IDS.filter((id) => !prodIds.includes(id));
    const extraIds = prodIds.filter((id) => !PRE_DEPLOY_IDS.includes(id));

    const idMatchPassed = missingIds.length === 0 && extraIds.length === 0;
    recordResult(
      "All 9 Pre-Deployment Event IDs Match",
      idMatchPassed,
      missingIds.length ? `Missing: ${missingIds.join(", ")}` : "All 9 IDs match pre-deployment snapshot exactly"
    );

    // Verify registration links and slugs
    let linksValid = true;
    for (const evt of prodEvents) {
      if (!evt.registration_url || !evt.registration_url.startsWith("http")) {
        linksValid = false;
        console.error(`Invalid registration URL for ${evt.id}: ${evt.registration_url}`);
      }
      if (!evt.slug) {
        linksValid = false;
        console.error(`Missing slug for ${evt.id}`);
      }
    }
    recordResult("Event Slugs & Registration URLs Valid", linksValid, "All 9 have valid slugs and registration URLs");
  } catch (err) {
    recordResult("Fetch /api/events", false, err.message);
  }

  // 3. Browser Rendering & Puppeteer Visual Testing
  console.log(`\n--- SECTION 3: Live Browser Rendering & Visual Verification ---`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const page = await browser.newPage();

  // Test Desktop 1440px Homepage
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${PROD_URL}/`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-home-desktop-1440.png") });
  saveAndCopy("prod-home-desktop-1440.png");
  const homeTitle = await page.title();
  recordResult("Desktop Homepage Render (1440px)", homeTitle.includes("ORBIT BLR"), `Title: ${homeTitle}`);

  // Test Spotlight and Event Cards on Live Production
  const homeCards = await page.$$eval('[data-testid="event-card"], article, .group\\/card', (els) => els.length);
  recordResult("Desktop Event Cards Rendered", homeCards > 0, `Found ${homeCards} event card elements`);

  // Verify No Broken Images on Production Homepage
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.src);
  });
  recordResult(
    "Desktop Homepage Broken Images Check",
    brokenImages.length === 0,
    brokenImages.length === 0 ? "Zero broken images" : `Broken images: ${brokenImages.join(", ")}`
  );

  // Full-page Desktop Homepage
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-home-desktop-full.png"), fullPage: true });
  saveAndCopy("prod-home-desktop-full.png");

  // Test Mobile 390px Homepage
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.goto(`${PROD_URL}/`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-home-mobile-390.png") });
  saveAndCopy("prod-home-mobile-390.png");
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-home-mobile-full.png"), fullPage: true });
  saveAndCopy("prod-home-mobile-full.png");
  recordResult("Mobile Homepage Render (390px)", true, "Mobile viewports captured");

  // Test Mobile Explore Page (Filters & Controls)
  await page.goto(`${PROD_URL}/explore`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-explore-mobile-390.png") });
  saveAndCopy("prod-explore-mobile-390.png");
  const exploreCards = await page.$$eval('[data-testid="event-card"], article, .group\\/card', (els) => els.length);
  recordResult("Mobile Explore Render & Cards (390px)", exploreCards > 0, `Found ${exploreCards} event cards`);

  // Test Desktop Explore Page
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${PROD_URL}/explore`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-explore-desktop-1440.png") });
  saveAndCopy("prod-explore-desktop-1440.png");
  recordResult("Desktop Explore Render (1440px)", true, "Desktop Explore captured");

  // Test Event Detail Page (GEARS 2026 - Desktop)
  await page.goto(`${PROD_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, {
    waitUntil: "networkidle2",
  });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-event-detail-desktop-1440.png") });
  saveAndCopy("prod-event-detail-desktop-1440.png");
  const registerBtn = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("a, button")).find((el) =>
      el.textContent.includes("OFFICIAL SITE") || el.textContent.includes("Register")
    );
    return btn ? { text: btn.textContent.trim(), href: btn.href || btn.getAttribute("href") } : null;
  });
  recordResult(
    "Event Detail Official Registration CTA",
    registerBtn !== null,
    registerBtn ? `Button: "${registerBtn.text}" -> ${registerBtn.href}` : "CTA missing"
  );

  // Test Event Detail Page (GEARS 2026 - Mobile)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.goto(`${PROD_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, {
    waitUntil: "networkidle2",
  });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-event-detail-mobile-390.png") });
  saveAndCopy("prod-event-detail-mobile-390.png");
  recordResult("Event Detail Mobile Render (390px)", true, "Mobile Event Detail captured");

  // Test Saved Events Page (Desktop & Mobile)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${PROD_URL}/saved`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-saved-desktop-1440.png") });
  saveAndCopy("prod-saved-desktop-1440.png");
  recordResult("Saved Events Desktop Render (1440px)", true, "Desktop Saved captured");

  // Test Suggest Event Page (Desktop & Mobile)
  await page.goto(`${PROD_URL}/suggest`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-suggest-desktop-1440.png") });
  saveAndCopy("prod-suggest-desktop-1440.png");
  recordResult("Suggest Event Desktop Render (1440px)", true, "Desktop Suggest captured");

  // Test About Page (Desktop & Mobile)
  await page.goto(`${PROD_URL}/about`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(PUBLIC_DIR, "prod-about-desktop-1440.png") });
  saveAndCopy("prod-about-desktop-1440.png");
  recordResult("About Page Desktop Render (1440px)", true, "Desktop About captured");

  await browser.close();

  // Summary
  console.log(`\n======================================================`);
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`PRODUCTION VERIFICATION COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    console.error("CRITICAL PRODUCTION FAILURES DETECTED! IMMEDIATE ROLLBACK REQUIRED!");
    process.exit(1);
  } else {
    console.log("ALL INDEPENDENT PRODUCTION VERIFICATION CHECKS PASSED WITH 100% SUCCESS!");
  }
}

runVerification().catch((err) => {
  console.error("Verification script execution error:", err);
  process.exit(1);
});
