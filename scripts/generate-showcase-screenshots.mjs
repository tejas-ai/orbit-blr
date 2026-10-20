import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(process.cwd(), "linkedin-showcase");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read admin password from .env.local
let adminPassword = "";
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  const match = envContent.match(/ORBIT_ADMIN_PASSWORD=(.*)/);
  if (match) {
    adminPassword = match[1].trim().replace(/^["']|["']$/g, "");
  }
} catch (e) {
  console.warn("Could not read .env.local:", e.message);
}

async function captureShowcase() {
  console.log("================================================================================");
  console.log("📸 GENERATING ULTRA HIGH-RES LINKEDIN SHOWCASE SCREENSHOTS (2X RETINA)");
  console.log(`📂 Output Directory: ${OUTPUT_DIR}`);
  console.log("================================================================================");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // 2x Retina for crisp professional display
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
    console.log(`📷 Capturing: ${filename} from ${url}...`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });

    if (options.setup) {
      await options.setup(page);
    }

    if (options.delay) {
      await new Promise((r) => setTimeout(r, options.delay));
    }

    if (options.scrollTo) {
      await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (el) el.scrollIntoView({ behavior: "instant" });
        else window.scrollBy(0, 700);
      }, options.scrollTo);
      await new Promise((r) => setTimeout(r, 800));
    } else if (options.scrollBy) {
      await page.evaluate((y) => window.scrollBy(0, y), options.scrollBy);
      await new Promise((r) => setTimeout(r, 800));
    }

    const savePath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({ path: savePath, fullPage: options.fullPage || false });
    console.log(`   ✅ Saved: ${filename}`);
  }

  try {
    // -------------------------------------------------------------------------
    // DESKTOP SHOWCASE (1920x1080 @ 2x)
    // -------------------------------------------------------------------------
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    // 01. Homepage Hero & Search Dock
    await snap(`${BASE_URL}/`, "01-district-hero-search-dock.png", {
      delay: 1000,
      fullPage: false,
    });

    // 02. The Bengaluru Edit Directory (Scrolled to 4-column card grid)
    await snap(`${BASE_URL}/`, "02-bengaluru-edit-directory.png", {
      delay: 600,
      scrollTo: "#events-directory",
      fullPage: false,
    });

    // 03. Dedicated Hackathons Discovery
    await snap(`${BASE_URL}/explore?category=Hackathons`, "03-dedicated-hackathons-page.png", {
      delay: 800,
      fullPage: false,
    });

    // 04. Event Detail Page with Sticky Booking Rail (Hackman X)
    await snap(`${BASE_URL}/events/hackman-x-2026-dsce-bengaluru`, "04-event-detail-sticky-booking.png", {
      delay: 800,
      scrollBy: 250,
      fullPage: false,
    });

    // 05. Saved Events Personal Dashboard (Ensure 1-2 events are saved)
    await snap(`${BASE_URL}/saved`, "05-saved-events-dashboard.png", {
      setup: async (p) => {
        await p.evaluate(() => {
          localStorage.setItem(
            "orbit_blr_saved_events",
            JSON.stringify([
              "evt-blrdroid-blrkotlin-20261024",
              "evt-hackman-x-20261026",
            ])
          );
        });
      },
      delay: 1000,
      fullPage: false,
    });

    // 06. Community Event Suggestion Portal
    await snap(`${BASE_URL}/suggest`, "06-community-suggest-portal.png", {
      delay: 600,
      fullPage: false,
    });

    // 07. Verification Standard & Transparency Protocol
    await snap(`${BASE_URL}/about`, "07-verification-standard-protocol.png", {
      delay: 600,
      fullPage: false,
    });

    // 08. Admin Operations Login Portal (Unauthenticated)
    await page.deleteCookie({ name: "orbit_admin_session", domain: "localhost" });
    await snap(`${BASE_URL}/admin`, "08-admin-login-portal.png", {
      delay: 600,
      fullPage: false,
    });

    // 09. Admin Operations & Review Dashboard (Authenticated)
    if (adminPassword) {
      await page.setCookie({
        name: "orbit_admin_session",
        value: adminPassword,
        domain: "localhost",
        path: "/",
      });
      await snap(`${BASE_URL}/admin`, "09-admin-operations-dashboard.png", {
        delay: 1200,
        fullPage: false,
      });
    }

    // -------------------------------------------------------------------------
    // MOBILE SHOWCASE (iPhone 14: 390x844 @ 2x)
    // -------------------------------------------------------------------------
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

    // 10. Mobile Home with Bottom Navigation Bar
    await snap(`${BASE_URL}/`, "10-mobile-home-bottomnav.png", {
      delay: 800,
      fullPage: false,
    });

    // 11. Mobile Dedicated Hackathons View
    await snap(`${BASE_URL}/explore?category=Hackathons`, "11-mobile-hackathons-discovery.png", {
      delay: 800,
      fullPage: false,
    });

    // 12. Mobile Event Detail with Exclusive Sticky RSVP Bar
    await snap(`${BASE_URL}/events/hackman-x-2026-dsce-bengaluru`, "12-mobile-event-detail-sticky-rsvp.png", {
      delay: 800,
      scrollBy: 300,
      fullPage: false,
    });

  } catch (err) {
    console.error("❌ Error capturing showcase screenshots:", err);
  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log("✨ ALL SHOWCASE SCREENSHOTS GENERATED SUCCESSFULLY!");
  console.log(`📁 Files saved in: ${OUTPUT_DIR}`);
  console.log("================================================================================");
}

captureShowcase();
