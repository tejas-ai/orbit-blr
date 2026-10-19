import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.join("D:\\Orbit Bengaluru", "linkedin-screenshots");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read admin password from .env.local
const envContent = fs.readFileSync("D:\\Orbit Bengaluru\\.env.local", "utf-8");
const pwdMatch = envContent.match(/ORBIT_ADMIN_PASSWORD=(.*)/);
const adminPassword = pwdMatch ? pwdMatch[1].trim().replace(/^["']|["']$/g, "") : "Tejas#2004";

async function captureAll() {
  console.log("🚀 Launching Chrome to capture LinkedIn showcase screenshots...");
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2, // 2x Retina resolution for razor-sharp social cards
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
    // 1. Hero Landing Page with 3D Globe & Stats
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await snap("https://orbit-blr.vercel.app", "01-hero-landing-page.png", {
      delay: 3000, // Wait for Three.js 3D canvas and animations
    });

    // 2. Trust & 7-Point Verification Protocol Section
    console.log("📸 Capturing: 02-verification-protocol.png...");
    await page.goto("https://orbit-blr.vercel.app#verification", { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 2000));
    const verificationEl = await page.$("#verification");
    if (verificationEl) {
      await verificationEl.screenshot({
        path: path.join(outputDir, "02-verification-protocol.png"),
      });
      console.log(`✅ Saved: 02-verification-protocol.png`);
    }

    // 3. Explore Directory & Strict Evidence Policy View
    await snap("https://orbit-blr.vercel.app/explore", "03-explore-directory-filters.png", {
      delay: 2000,
      fullPage: false,
    });

    // 4. Community Event Submission / Suggestion Form
    await snap("https://orbit-blr.vercel.app/suggest", "04-community-event-suggest.png", {
      delay: 1500,
      fullPage: false,
    });

    // 5. Admin Authentication Portal (Pre-login)
    await snap("https://orbit-blr.vercel.app/admin", "05-admin-login-portal.png", {
      delay: 1500,
    });

    // 6. Authenticate into Admin Dashboard
    console.log("🔐 Authenticating into Admin Dashboard with configured credentials...");
    await page.goto("https://orbit-blr.vercel.app/admin", { waitUntil: "networkidle2" });
    await page.waitForSelector("input[type='password']", { timeout: 10000 });
    await page.type("input[type='password']", adminPassword);
    await page.click("button[type='submit']");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2500));

    // Capture Full Authenticated Admin Dashboard Overview
    console.log("📸 Capturing: 06-admin-dashboard-overview.png...");
    await page.screenshot({
      path: path.join(outputDir, "06-admin-dashboard-overview.png"),
      fullPage: false,
    });
    console.log("✅ Saved: 06-admin-dashboard-overview.png");

    // Capture Review Queue & Event Inventory Table
    console.log("📸 Capturing: 07-admin-review-queue.png...");
    await page.screenshot({
      path: path.join(outputDir, "07-admin-review-queue.png"),
      fullPage: true,
    });
    console.log("✅ Saved: 07-admin-review-queue.png");

    // 7. Mobile Viewport (iPhone 15 Pro / Pixel dimensions)
    console.log("📱 Capturing Mobile Responsive Views...");
    await page.setViewport({
      width: 412,
      height: 915,
      deviceScaleFactor: 2.6,
      isMobile: true,
      hasTouch: true,
    });

    await snap("https://orbit-blr.vercel.app", "08-mobile-hero-experience.png", {
      delay: 3000,
    });

    await snap("https://orbit-blr.vercel.app/explore", "09-mobile-directory-view.png", {
      delay: 2000,
    });

    console.log("\n🎉 All 9 professional high-resolution screenshots generated successfully!");
    console.log(`📁 Files are located in: ${outputDir}`);
  } catch (err) {
    console.error("❌ Screenshot capture error:", err);
  } finally {
    await browser.close();
  }
}

captureAll();
