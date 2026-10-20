import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUBLIC_DIR = path.join(process.cwd(), "public", "screenshots");
const ARTIFACT_DIR = "C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988";

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 250;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 30);
    });
  });
  await new Promise((r) => setTimeout(r, 600));
}

async function saveScreenshot(page, filename) {
  const pubPath = path.join(PUBLIC_DIR, filename);
  const artPath = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: pubPath });
  fs.copyFileSync(pubPath, artPath);
  console.log(`✓ Saved screenshot: ${filename}`);
}

async function run() {
  console.log("=== ORBIT BLR 3.1: DUAL-THEME & SCROLL QA AUTOMATION ===");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const testResults = [];

  try {
    // -------------------------------------------------------------
    // TEST 1: DESKTOP HOMEPAGE — LIGHT MODE (1440px)
    // -------------------------------------------------------------
    {
      console.log("\n[1/8] Capturing Desktop Homepage — Light Mode (1440px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "light");
      });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
      await autoScroll(page);

      // Verify light mode
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      testResults.push({ name: "Homepage Light Mode Default", pass: !isDark });

      await saveScreenshot(page, "orbit-3-1-home-desktop-light-1440.png");
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 2: THEME SWITCHING INTERACTION & PERSISTENCE
    // -------------------------------------------------------------
    {
      console.log("\n[2/8] Testing Desktop Theme Switcher & Persistence...");
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
      
      // Ensure clean light starting state
      await page.evaluate(() => {
        localStorage.setItem("orbit_theme", "light");
        document.documentElement.classList.remove("dark");
      });

      // Click theme switcher button
      const toggleSelector = 'button[data-testid="theme-toggle"]';
      await page.waitForSelector(toggleSelector);
      await page.click(toggleSelector);
      await new Promise((r) => setTimeout(r, 400));

      const isNowDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      const storedTheme = await page.evaluate(() => localStorage.getItem("orbit_theme"));
      testResults.push({ name: "Toggle from Light to Dark Mode", pass: isNowDark });
      testResults.push({ name: "localStorage Theme Persistence (dark)", pass: storedTheme === "dark" });

      // Reload page and verify zero-FOIT persistence
      await page.reload({ waitUntil: "networkidle0" });
      const persistsDarkAfterReload = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      const storedAfterReload = await page.evaluate(() => localStorage.getItem("orbit_theme"));
      testResults.push({ name: "Dark Mode Persists on Reload (Zero FOIT)", pass: persistsDarkAfterReload && storedAfterReload === "dark" });

      // Capture Desktop Homepage — Dark Mode (1440px)
      await autoScroll(page);
      await saveScreenshot(page, "orbit-3-1-home-desktop-dark-1440.png");

      // Now toggle back to Light mode
      await page.click(toggleSelector);
      await new Promise((r) => setTimeout(r, 400));
      const isBackToLight = await page.evaluate(() => !document.documentElement.classList.contains("dark"));
      const storedLight = await page.evaluate(() => localStorage.getItem("orbit_theme"));
      testResults.push({ name: "Toggle back to Light Mode", pass: isBackToLight && storedLight === "light" });

      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 3: MOBILE HOMEPAGE — LIGHT MODE (390px)
    // -------------------------------------------------------------
    {
      console.log("\n[3/8] Capturing Mobile Homepage — Light Mode (390px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "light");
      });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
      await autoScroll(page);

      // Verify no horizontal overflow
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      testResults.push({ name: "Mobile 390px No Horizontal Overflow (Light)", pass: !overflow });

      await saveScreenshot(page, "orbit-3-1-home-mobile-light-390.png");
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 4: MOBILE HOMEPAGE — DARK MODE (390px)
    // -------------------------------------------------------------
    {
      console.log("\n[4/8] Capturing Mobile Homepage — Dark Mode (390px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "dark");
      });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
      await autoScroll(page);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      testResults.push({ name: "Mobile 390px No Horizontal Overflow (Dark)", pass: !overflow });

      await saveScreenshot(page, "orbit-3-1-home-mobile-dark-390.png");
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 5: EXPLORE DIRECTORY — DARK MODE (1440px)
    // -------------------------------------------------------------
    {
      console.log("\n[5/8] Capturing Explore Directory — Dark Mode (1440px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "dark");
      });
      await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle0" });
      await autoScroll(page);

      await saveScreenshot(page, "orbit-3-1-explore-desktop-dark-1440.png");
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 6: HACKATHONS DIRECTORY — DARK MODE (1440px)
    // -------------------------------------------------------------
    {
      console.log("\n[6/8] Capturing Free Hackathons Directory — Dark Mode (1440px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "dark");
      });
      await page.goto(`${BASE_URL}/explore?category=Hackathons`, { waitUntil: "networkidle0" });
      await autoScroll(page);

      await saveScreenshot(page, "orbit-3-1-hackathons-desktop-dark-1440.png");
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 7: EVENT DETAIL PAGE — DARK MODE (1440px & 390px)
    // -------------------------------------------------------------
    const detailUrl = `${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`;

    {
      console.log("\n[7/8] Capturing Event Detail Page — Dark Mode (1440px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "dark");
      });
      await page.goto(detailUrl, { waitUntil: "networkidle0" });
      await autoScroll(page);

      await saveScreenshot(page, "orbit-3-1-event-detail-desktop-dark-1440.png");
      await page.close();
    }

    {
      console.log("\n[8/8] Capturing Event Detail Page — Dark Mode (390px)...");
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "dark" }]);
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("orbit_theme", "dark");
      });
      await page.goto(detailUrl, { waitUntil: "networkidle0" });
      await autoScroll(page);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      testResults.push({ name: "Event Detail Mobile 390px No Horizontal Overflow", pass: !overflow });

      await saveScreenshot(page, "orbit-3-1-event-detail-mobile-dark-390.png");
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 9: VIEWPORT RESPONSIVENESS (320px, 430px, 768px)
    // -------------------------------------------------------------
    for (const width of [320, 430, 768]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 800, deviceScaleFactor: 1 });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      testResults.push({ name: `Homepage ${width}px No Horizontal Overflow`, pass: !overflow });
      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 10: BIDIRECTIONAL SCROLL ANIMATION CHECK
    // -------------------------------------------------------------
    {
      console.log("\nVerifying Bidirectional Scroll Animation Engine...");
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500));
      await new Promise((r) => setTimeout(r, 200));
      const hasInViewDown = await page.evaluate(() => {
        const els = document.querySelectorAll(".scroll-reveal.in-view");
        return els.length > 0;
      });
      testResults.push({ name: "Downward Scroll Animation Triggers in-view", pass: hasInViewDown });

      // Scroll up
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 200));
      const hasInViewTop = await page.evaluate(() => {
        const hero = document.querySelector(".scroll-reveal");
        return hero && hero.classList.contains("in-view");
      });
      testResults.push({ name: "Upward Scroll Re-activates in-view", pass: Boolean(hasInViewTop) });

      await page.close();
    }

    // -------------------------------------------------------------
    // TEST 11: PREFERS-REDUCED-MOTION COMPLIANCE
    // -------------------------------------------------------------
    {
      console.log("\nVerifying prefers-reduced-motion compliance...");
      const page = await browser.newPage();
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });

      const reducedMotionHandled = await page.evaluate(() => {
        const el = document.querySelector(".scroll-reveal");
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.transitionDuration === "0s" || style.opacity === "1";
      });
      testResults.push({ name: "Prefers-Reduced-Motion Compliance", pass: Boolean(reducedMotionHandled) });
      await page.close();
    }

  } catch (err) {
    console.error("QA script error:", err);
  } finally {
    await browser.close();
  }

  console.log("\n=== AUTOMATED QA TEST RESULTS ===");
  let passedCount = 0;
  testResults.forEach((t) => {
    if (t.pass) passedCount++;
    console.log(`${t.pass ? "✅ PASS" : "❌ FAIL"}: ${t.name}`);
  });
  console.log(`\nTotal: ${passedCount}/${testResults.length} checks PASSED.`);

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "orbit-3-1-qa-results.json"),
    JSON.stringify({ testResults, passedCount, total: testResults.length, timestamp: new Date().toISOString() }, null, 2)
  );
}

run();
