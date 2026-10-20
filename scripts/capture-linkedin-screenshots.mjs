import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.join("D:\\Orbit Bengaluru", "linkedin-screenshots");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function captureAll() {
  console.log("🚀 Launching Chrome to capture Vice City meets Bengaluru cinematic showcase screenshots...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // 2x Retina resolution for ultra-sharp 4K LinkedIn cards
    },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();

  // Helper for waiting and screenshotting
  async function snap(url, filename, options = {}) {
    console.log(`📸 Capturing: ${filename} from ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 10000 }).catch(() => {});
    }
    if (options.delay) {
      await new Promise((r) => setTimeout(r, options.delay));
    }
    const savePath = path.join(outputDir, filename);
    await page.screenshot({ path: savePath, fullPage: options.fullPage || false });
    console.log(`✅ Saved: ${savePath}`);
  }

  try {
    // 1. Cinematic Hero with Sunset Atmosphere & 3D Globe
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await snap("https://orbit-blr.vercel.app", "01-cinematic-hero-sunset.png", {
      delay: 3500, // Wait for Three.js 3D canvas and atmospheric layers
    });

    // 2. Authentic Thumbnails Gallery on Homepage
    await page.evaluate(() => {
      const el = document.getElementById("events-directory");
      if (el) el.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(outputDir, "02-authentic-thumbnails-directory.png"),
      fullPage: false,
    });
    console.log("✅ Saved: 02-authentic-thumbnails-directory.png");

    // 3. Explore Gallery with Category & Area Filters
    await snap("https://orbit-blr.vercel.app/explore", "03-explore-gallery-filters.png", {
      delay: 2500,
    });

    // 4. Event Editorial Detail Page with Large Poster Hero
    await snap(
      "https://orbit-blr.vercel.app/events/blrdroid-blrkotlin-october-2026-meetup-133",
      "04-event-editorial-detail-hero.png",
      { delay: 3000 }
    );

    // 5. Verified Benefits & Audit Trail
    await page.evaluate(() => {
      window.scrollBy(0, 500);
    });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({
      path: path.join(outputDir, "05-verified-perks-evidence-breakdown.png"),
      fullPage: false,
    });
    console.log("✅ Saved: 05-verified-perks-evidence-breakdown.png");

    // 6. Community Event Suggestion Form
    await snap("https://orbit-blr.vercel.app/suggest", "06-community-suggest-event.png", {
      delay: 2000,
    });

    // 7. Bengaluru Tech Corridors Radar Section
    await page.goto("https://orbit-blr.vercel.app", { waitUntil: "networkidle2" });
    await page.evaluate(() => {
      window.scrollBy(0, 1600);
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({
      path: path.join(outputDir, "07-bengaluru-tech-corridors.png"),
      fullPage: false,
    });
    console.log("✅ Saved: 07-bengaluru-tech-corridors.png");

    // 8. 7-Point Verification Protocol Section
    await snap("https://orbit-blr.vercel.app/about#verification", "08-verification-protocol.png", {
      delay: 2500,
    });

    // 9. Mobile Cinematic Hero Experience
    console.log("📱 Capturing Mobile Responsive Views...");
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await snap("https://orbit-blr.vercel.app", "09-mobile-hero-experience.png", {
      delay: 3500,
    });

    // 10. Mobile Event Card Thumbnails
    await snap("https://orbit-blr.vercel.app/explore", "10-mobile-directory-thumbnails.png", {
      delay: 2500,
    });

    console.log("\n🎉 All 10 cinematic high-resolution screenshots generated successfully!");
    console.log(`📁 Files are located strictly in: ${outputDir}`);
  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    await browser.close();
  }
}

captureAll();
