import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.join("D:\\Orbit Bengaluru", "linkedin-screenshots");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function captureBeforeAndAfter() {
  console.log("🚀 Launching Chrome to capture authentic Before-and-After screenshots...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // 2x Retina resolution for crisp screenshots
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

  async function snap(url, filename, options = {}) {
    console.log(`📸 Capturing: ${filename} from ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
    if (options.delay) {
      await new Promise((r) => setTimeout(r, options.delay));
    }
    if (options.scroll) {
      await page.evaluate((selector) => {
        const el = selector ? document.querySelector(selector) : null;
        if (el) el.scrollIntoView({ behavior: "instant" });
        else window.scrollBy(0, 750);
      }, options.scroll);
      await new Promise((r) => setTimeout(r, 1000));
    }
    const savePath = path.join(outputDir, filename);
    await page.screenshot({ path: savePath, fullPage: options.fullPage || false });
    console.log(`✅ Saved: ${savePath}`);
  }

  try {
    // -------------------------------------------------------------
    // 1. BEFORE (Current Production Live Website)
    // -------------------------------------------------------------
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await snap("https://orbit-blr.vercel.app", "before-01-production-homepage.png", { delay: 2500 });
    await snap("https://orbit-blr.vercel.app/explore", "before-02-production-explore.png", { delay: 2000 });
    await snap("https://orbit-blr.vercel.app/events/blrdroid-blrkotlin-october-2026-meetup-133", "before-03-production-detail.png", { delay: 2000 });

    // -------------------------------------------------------------
    // 2. AFTER (Integrated District-Inspired Redesign on Localhost)
    // -------------------------------------------------------------
    // Desktop Homepage with District Split Hero & Search Dock
    await snap("http://localhost:3000", "after-01-district-homepage-hero-searchdock.png", { delay: 2500 });

    // Desktop Category Interest Tiles & The Bengaluru Edit Directory
    await snap("http://localhost:3000", "after-02-district-bengaluru-edit-directory.png", {
      delay: 2000,
      scroll: "#events-directory",
    });

    // Dedicated Hackathons Discovery View
    await snap("http://localhost:3000/explore?category=Hackathons", "after-03-district-dedicated-hackathons.png", { delay: 2000 });

    // Redesigned Event Detail Page with Widescreen Hero & Sticky Booking Rail
    await snap("http://localhost:3000/events/devforge-hackathon-yugaantar-2026", "after-04-district-event-detail-sticky-booking.png", { delay: 2000 });

    // Saved Events Dashboard
    await snap("http://localhost:3000/saved", "after-05-district-saved-events-dashboard.png", { delay: 2000 });

    // -------------------------------------------------------------
    // 3. AFTER (Mobile Responsive Views)
    // -------------------------------------------------------------
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    // Mobile Homepage with District Header and Bottom Navigation
    await snap("http://localhost:3000", "after-06-district-mobile-home-bottomnav.png", { delay: 2500 });

    // Mobile Dedicated Hackathons View
    await snap("http://localhost:3000/explore?category=Hackathons", "after-07-district-mobile-hackathons.png", { delay: 2000 });

    // Mobile Event Detail Page with Sticky Bottom RSVP Button (No overlapping nav)
    await snap("http://localhost:3000/events/devforge-hackathon-yugaantar-2026", "after-08-district-mobile-detail-sticky-bar.png", { delay: 2500 });

    console.log("\n🎉 All Before-and-After screenshots generated successfully!");
    console.log(`📁 Files are located strictly in: ${outputDir}`);
  } catch (err) {
    console.error("Screenshot error:", err);
  } finally {
    await browser.close();
  }
}

captureBeforeAndAfter();
