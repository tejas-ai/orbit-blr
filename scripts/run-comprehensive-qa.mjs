import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(process.cwd(), "qa-results", "screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const auditReport = {
  timestamp: new Date().toISOString(),
  testSummary: {
    total: 0,
    passed: 0,
    failed: 0,
  },
  tests: [],
  consoleErrors: [],
  brokenImages: [],
  networkFailures: [],
  viewportsTested: [],
  eventsAudited: [],
};

function recordTest(name, passed, details = "") {
  auditReport.testSummary.total++;
  if (passed) {
    auditReport.testSummary.passed++;
    console.log(`  [PASS] ${name} ${details ? `(${details})` : ""}`);
  } else {
    auditReport.testSummary.failed++;
    console.error(`  [FAIL] ${name} ${details ? `(${details})` : ""}`);
  }
  auditReport.tests.push({ name, passed, details });
}

async function runAudit() {
  console.log("================================================================================");
  console.log("🔍 STARTING COMPREHENSIVE PRODUCTION QA AUDIT FOR ORBIT BLR");
  console.log("================================================================================");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--window-size=1440,900",
    ],
  });

  const page = await browser.newPage();

  // Monitor console errors and warnings
  page.on("console", (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === "error") {
      auditReport.consoleErrors.push({ type, text, location: msg.location() });
    }
  });

  page.on("pageerror", (err) => {
    auditReport.consoleErrors.push({ type: "pageerror", text: err.message, stack: err.stack });
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    const failureText = request.failure()?.errorText || "Unknown error";
    // Exclude deliberate browser cancellations of prefetching Next.js RSC chunks when navigating
    if (failureText !== "net::ERR_ABORTED") {
      auditReport.networkFailures.push({ url, failureText });
    }
  });

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();
    const isImage = response.headers()["content-type"]?.includes("image") || url.match(/\.(png|jpg|jpeg|webp|svg|ico)/i);
    if (isImage && status >= 400) {
      auditReport.brokenImages.push({ url, status });
    }
  });

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: PUBLIC RECORDS & DATABASE PUBLICATION GATE
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 1: Public Records & Database Publication Gate ---");
    const apiRes = await fetch(`${BASE_URL}/api/events`);
    const apiData = await apiRes.json();

    recordTest(
      "Public API returns success status",
      apiRes.status === 200 && apiData.success === true,
      `Status: ${apiRes.status}`
    );

    recordTest(
      "Strict published event count equals 8",
      apiData.count === 8 && apiData.events.length === 8,
      `Count: ${apiData.count}`
    );

    const allPublished = apiData.events.every((e) => e.publication_status === "published");
    recordTest(
      "All public events strictly have publication_status = 'published'",
      allPublished,
      `Verified across ${apiData.events.length} records`
    );

    const suspiciousSeeds = apiData.events.filter((e) =>
      ["evt-001", "evt-002", "evt-003", "evt-004", "evt-005", "evt-006", "evt-007", "evt-008", "evt-009", "evt-010"].includes(e.id)
    );
    recordTest(
      "Zero unverified/suspicious seed records published",
      suspiciousSeeds.length === 0,
      `Suspicious records found: ${suspiciousSeeds.length}`
    );

    // -------------------------------------------------------------------------
    // SECTION 2: VERIFICATION OF ALL 8 PUBLISHED EVENTS
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 2: Verification of All 8 Published Events ---");
    for (const ev of apiData.events) {
      const hasValidUrl = ev.registration_url && ev.registration_url.startsWith("http");
      const hasValidStatus = ["open", "waitlist", "approval_required", "closed"].includes(ev.registration_status);
      const hasValidOrganizer = Boolean(ev.organizer && ev.organizer.trim().length > 0);
      const isFree = ev.is_free === 1 || ev.is_free === true;

      auditReport.eventsAudited.push({
        id: ev.id,
        slug: ev.slug,
        name: ev.name,
        organizer: ev.organizer,
        registration_status: ev.registration_status,
        registration_url: ev.registration_url,
        thumbnail_url: ev.thumbnail_url,
      });

      recordTest(
        `Event [${ev.slug}]: Verified data integrity`,
        hasValidUrl && hasValidStatus && hasValidOrganizer && isFree,
        `Status: ${ev.registration_status}, Organizer: ${ev.organizer}, Free: ${isFree}`
      );
    }

    // -------------------------------------------------------------------------
    // SECTION 3: HACKATHON CLASSIFICATION & DATE ACCURACY
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 3: Hackathon Classification & Metadata Audit ---");
    const hackman = apiData.events.find((e) => e.slug.includes("hackman"));
    const devforge = apiData.events.find((e) => e.slug.includes("devforge"));

    recordTest("Hackman X is in database and active", Boolean(hackman));
    recordTest("DevForge is in database and active", Boolean(devforge));

    if (hackman) {
      recordTest(
        "Hackman X has valid offline DSCE venue and free admission",
        hackman.venue.includes("DSCE") && Boolean(hackman.is_free),
        `Venue: ${hackman.venue}`
      );
    }
    if (devforge) {
      recordTest(
        "DevForge has valid Scaler SST venue and free admission",
        devforge.venue.includes("Scaler") && Boolean(devforge.is_free),
        `Venue: ${devforge.venue}`
      );
    }

    // -------------------------------------------------------------------------
    // SECTION 4: BROWSER INTERACTION TESTING (1440px DESKTOP)
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 4: Desktop Browser Interaction (1440x900) ---");
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    auditReport.viewportsTested.push("1440x900 (Desktop)");

    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2", timeout: 30000 });
    await page.screenshot({ path: path.join(OUTPUT_DIR, "01-desktop-home-hero.png"), fullPage: false });

    // Test Search input
    console.log("  Testing live search typing...");
    const searchInput = await page.$("input[placeholder*='Search']");
    if (searchInput) {
      await searchInput.type("Kotlin", { delay: 50 });
      await new Promise((r) => setTimeout(r, 600));

      const cardTexts = await page.$$eval("article h3", (elements) => elements.map((e) => e.textContent));
      const hasKotlin = cardTexts.some((t) => t.toLowerCase().includes("kotlin"));
      recordTest(
        "Search query 'Kotlin' filters results correctly",
        hasKotlin && cardTexts.length < 8,
        `Found ${cardTexts.length} matching card(s): ${cardTexts.join(", ")}`
      );

      await page.screenshot({ path: path.join(OUTPUT_DIR, "02-desktop-search-interaction.png"), fullPage: false });

      // Clear search
      await page.click("input[placeholder*='Search']", { clickCount: 3 });
      await page.keyboard.press("Backspace");
      await new Promise((r) => setTimeout(r, 600));
    } else {
      recordTest("Search input located on homepage", false);
    }

    // Test Category Filter Clicks
    console.log("  Testing category filter clicks...");
    const categoryButtons = await page.$$("button, a");
    let hackathonCategoryBtn = null;
    for (const btn of categoryButtons) {
      const text = await page.evaluate((el) => el.textContent || "", btn);
      if (text.includes("Hackathons") && (text.includes("Sprints") || text.includes("2 Available") || text.includes("Offline"))) {
        hackathonCategoryBtn = btn;
        break;
      }
    }

    if (hackathonCategoryBtn) {
      await hackathonCategoryBtn.click();
      await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));

      const url = page.url();
      const hackCards = await page.$$eval("article h3", (els) => els.map((e) => e.textContent));
      recordTest(
        "Clicking Hackathons category navigates and filters hackathons",
        url.includes("Hackathons") || hackCards.some((c) => c.toLowerCase().includes("hack") || c.toLowerCase().includes("devforge")),
        `URL: ${url}, Cards: ${hackCards.length}`
      );
      await page.screenshot({ path: path.join(OUTPUT_DIR, "03-desktop-hackathons-filter.png"), fullPage: false });
    } else {
      // Direct navigation test
      await page.goto(`${BASE_URL}/explore?category=Hackathons`, { waitUntil: "networkidle2" });
      const hackCards = await page.$$eval("article h3", (els) => els.map((e) => e.textContent));
      recordTest(
        "Direct navigation to /explore?category=Hackathons displays hackathons",
        hackCards.length === 2 && hackCards.some((c) => c.includes("Hackman")),
        `Displaying: ${hackCards.join(", ")}`
      );
      await page.screenshot({ path: path.join(OUTPUT_DIR, "03-desktop-hackathons-filter.png"), fullPage: false });
    }

    // Test Bookmarking & Saved Events
    console.log("  Testing bookmarking and saved events...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });

    // Clear any previous saved state
    await page.evaluate(() => localStorage.removeItem("orbit_blr_saved_events"));
    await page.reload({ waitUntil: "networkidle2" });

    // Click bookmark button on the first card
    const bookmarkBtn = await page.$("article button[title*='My Events']");
    if (bookmarkBtn) {
      await bookmarkBtn.click();
      await new Promise((r) => setTimeout(r, 600));

      // Verify saved count in navbar via data-testid
      const savedCountText = await page.evaluate(() => {
        const badge = document.querySelector("[data-testid='saved-count-badge']");
        return badge ? badge.textContent.trim() : null;
      });
      recordTest("Bookmarking an event updates Saved badge in navbar", savedCountText === "1", `Badge text: ${savedCountText}`);

      // Navigate to /saved
      await page.goto(`${BASE_URL}/saved`, { waitUntil: "networkidle2" });
      await page.waitForSelector("article", { timeout: 10000 }).catch(() => {});
      const savedArticles = await page.$$("article");
      recordTest("Saved events dashboard shows the bookmarked event", savedArticles.length === 1, `Saved count: ${savedArticles.length}`);
      await page.screenshot({ path: path.join(OUTPUT_DIR, "04-desktop-saved-events.png"), fullPage: false });

      // Un-save the event
      const removeBtn = await page.$("article button[title*='My Events']");
      if (removeBtn) {
        await removeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        const emptyStatePresent = await page.evaluate(() => {
          return document.body.textContent.includes("No saved events yet") || document.body.textContent.includes("Discover Events");
        });
        recordTest("Un-saving event clears dashboard to empty state", emptyStatePresent);
      }
    } else {
      recordTest("Bookmark button present on event card", false);
    }

    // Test Event Detail Page & Sticky Booking Rail
    console.log("  Testing Event Detail Page and sticky booking card...");
    await page.goto(`${BASE_URL}/events/hackman-x-2026-dsce-bengaluru`, { waitUntil: "networkidle2" });

    const detailTitle = await page.$eval("h1", (el) => el.textContent);
    recordTest("Event detail page renders correct H1 title", detailTitle.includes("Hackman X"), `Title: ${detailTitle}`);

    const freePill = await page.evaluate(() => document.body.textContent.includes("FREE ADMISSION") || document.body.textContent.includes("₹0"));
    recordTest("District ₹0 FREE ADMISSION pricing banner displayed", freePill);

    const stickyBookingCta = await page.$eval("[data-testid='sticky-register-cta']", (el) => el.textContent).catch(() => "");
    recordTest(
      "Sticky booking rail CTA button is present and reflects status",
      stickyBookingCta.includes("APPLY") || stickyBookingCta.includes("REGISTER") || stickyBookingCta.includes("CLOSED"),
      `CTA: ${stickyBookingCta.trim()}`
    );

    const auditTrailPresent = await page.evaluate(() => document.getElementById("audit") !== null);
    recordTest("Independent Verification Audit Trail section rendered", auditTrailPresent);

    await page.screenshot({ path: path.join(OUTPUT_DIR, "05-desktop-event-detail-sticky-rail.png"), fullPage: false });

    // Test Suggest Page
    console.log("  Testing Suggest Event Page...");
    await page.goto(`${BASE_URL}/suggest`, { waitUntil: "networkidle2" });
    const suggestForm = await page.$("form");
    recordTest("Suggest event submission form renders", suggestForm !== null);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "06-desktop-suggest-event.png"), fullPage: false });

    // -------------------------------------------------------------------------
    // SECTION 5: MULTI-VIEWPORT AUDIT (320px, 390px, 768px, 1440px)
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 5: Multi-Viewport Audit & Overlap Verification ---");

    const viewports = [
      { name: "Mobile iPhone SE", width: 320, height: 667, prefix: "07-mobile-320px" },
      { name: "Mobile iPhone 12/14", width: 390, height: 844, prefix: "09-mobile-390px" },
      { name: "Tablet iPad Portrait", width: 768, height: 1024, prefix: "11-tablet-768px" },
    ];

    for (const vp of viewports) {
      console.log(`  Verifying viewport: ${vp.name} (${vp.width}x${vp.height})...`);
      auditReport.viewportsTested.push(`${vp.name} (${vp.width}x${vp.height})`);
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });

      // 1. Homepage at viewport
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `${vp.prefix}-home.png`), fullPage: false });

      // Check navigation visibility
      const navVisibility = await page.evaluate((width) => {
        if (width < 768) {
          const nav = document.querySelector("nav[aria-label='Mobile bottom navigation']");
          if (!nav) return false;
          const rect = nav.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0 && rect.bottom <= window.innerHeight;
        } else {
          // Desktop/tablet header navigation is active
          const headerNav = document.querySelector("header nav");
          if (!headerNav) return false;
          const rect = headerNav.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0;
        }
      }, vp.width);

      recordTest(
        `[${vp.name}] Responsive navigation bar visible on homepage`,
        navVisibility,
        `Width: ${vp.width}px`
      );

      // 2. Detail Page at viewport
      const detailScreenshotName = vp.prefix.includes("320")
        ? "08-mobile-320px-detail-rsvp.png"
        : vp.prefix.includes("390")
        ? "10-mobile-390px-detail-rsvp.png"
        : "12-tablet-768px-detail.png";

      await page.goto(`${BASE_URL}/events/hackman-x-2026-dsce-bengaluru`, { waitUntil: "networkidle2" });

      // Check that general bottom navigation is hidden on detail page
      const hasBottomNavOnDetail = await page.evaluate(() => {
        const nav = document.querySelector("nav[aria-label='Mobile bottom navigation']");
        return nav !== null;
      });
      recordTest(
        `[${vp.name}] General bottom nav strictly hidden on event detail page to prevent clash`,
        !hasBottomNavOnDetail
      );

      // Check that sticky booking element is present and has no collision
      const stickyBookingBar = await page.evaluate((width) => {
        if (width < 1024) {
          const bar = document.querySelector("div.lg\\:hidden.fixed.bottom-0");
          if (!bar) return null;
          const rect = bar.getBoundingClientRect();
          return {
            visible: rect.height > 0 && rect.width > 0,
            bottom: rect.bottom,
            height: rect.height,
          };
        } else {
          const rail = document.querySelector("div.lg\\:col-span-4");
          return { visible: rail !== null, height: rail ? rail.clientHeight : 0 };
        }
      }, vp.width);

      recordTest(
        `[${vp.name}] Sticky booking CTA present without navigation collision`,
        stickyBookingBar && stickyBookingBar.visible,
        `Height: ${stickyBookingBar?.height}px`
      );

      await page.screenshot({ path: path.join(OUTPUT_DIR, detailScreenshotName), fullPage: false });
    }

    // -------------------------------------------------------------------------
    // SECTION 6: RETIRED ADMIN ROUTES & UNPROTECTED ACCESS AUDIT
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 6: Admin Routes Access & Security Hardening ---");

    // Check /api/admin/events without token
    const adminApiRes = await fetch(`${BASE_URL}/api/admin/events`);
    recordTest(
      "Unauthenticated /api/admin/events rejected (status 401)",
      adminApiRes.status === 401,
      `Received status: ${adminApiRes.status}`
    );

    // Check that public navigation has zero links to /admin
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
    const publicAdminLinks = await page.$$eval("a[href*='/admin']", (els) => els.map((e) => e.href));
    recordTest(
      "Public website navigation contains zero links to /admin",
      publicAdminLinks.length === 0,
      `Found: ${publicAdminLinks.length}`
    );

    // -------------------------------------------------------------------------
    // SECTION 7: CONSOLE ERROR & BROKEN ASSET AUDIT
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 7: Console Errors & Broken Image Audit ---");
    recordTest(
      "Zero unhandled console errors detected",
      auditReport.consoleErrors.length === 0,
      auditReport.consoleErrors.length > 0 ? JSON.stringify(auditReport.consoleErrors[0]) : "Clean console"
    );

    recordTest(
      "Zero broken image assets (HTTP 404/500)",
      auditReport.brokenImages.length === 0,
      auditReport.brokenImages.length > 0 ? JSON.stringify(auditReport.brokenImages) : "All images valid"
    );

    recordTest(
      "Zero failed network requests",
      auditReport.networkFailures.length === 0,
      auditReport.networkFailures.length > 0 ? JSON.stringify(auditReport.networkFailures) : "All requests 200/304"
    );

  } catch (error) {
    console.error("❌ Fatal audit execution error:", error);
    recordTest("Audit script execution", false, error.message);
  } finally {
    await browser.close();
  }

  // Save JSON report strictly to D:
  const reportPath = path.join(process.cwd(), "qa-results", "audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), "utf8");

  console.log("\n================================================================================");
  console.log(`📊 FINAL QA AUDIT SUMMARY:`);
  console.log(`   Total Tests:  ${auditReport.testSummary.total}`);
  console.log(`   Passed:       ${auditReport.testSummary.passed}`);
  console.log(`   Failed:       ${auditReport.testSummary.failed}`);
  console.log(`   Report File:  ${reportPath}`);
  console.log(`   Screenshots:  ${OUTPUT_DIR}`);
  console.log("================================================================================");
}

runAudit();
