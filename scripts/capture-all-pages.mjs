import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUBLIC_DIR = path.join(process.cwd(), "public", "screenshots");
const ARTIFACT_DIR = "C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988";

fs.mkdirSync(PUBLIC_DIR, { recursive: true });

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 40);
    });
  });
  await new Promise((r) => setTimeout(r, 600));
}

const PAGES_TO_CAPTURE = [
  { name: "home", path: "/", hasFull: true },
  { name: "explore", path: "/explore", hasFull: false },
  { name: "hackathons", path: "/explore?category=Hackathons", hasFull: false },
  { name: "event-detail", path: "/events/gears-2026-global-higher-education-ai-readiness-summit", hasFull: false },
  { name: "saved", path: "/saved", hasFull: false },
  { name: "suggest", path: "/suggest", hasFull: false },
  { name: "about", path: "/about", hasFull: false },
];

async function captureAllPages() {
  console.log("Launching Chrome for full sitewide verification screenshots...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  for (const pageConfig of PAGES_TO_CAPTURE) {
    const pageUrl = `${BASE_URL}${pageConfig.path}`;
    console.log(`\n========================================`);
    console.log(`Capturing: ${pageConfig.name.toUpperCase()} (${pageUrl})`);
    console.log(`========================================`);

    // 1. Desktop Viewport (1440 x 900)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 30000 });
      await autoScroll(page);

      const desktopFile = `orbit-3-${pageConfig.name}-desktop-1440.png`;
      const publicPath = path.join(PUBLIC_DIR, desktopFile);
      const artifactPath = path.join(ARTIFACT_DIR, desktopFile);

      await page.screenshot({ path: publicPath });
      fs.copyFileSync(publicPath, artifactPath);
      console.log(`✓ Desktop Saved: ${desktopFile}`);

      if (pageConfig.hasFull) {
        const desktopFullFile = `orbit-3-${pageConfig.name}-desktop-full.png`;
        const fullPublicPath = path.join(PUBLIC_DIR, desktopFullFile);
        const fullArtifactPath = path.join(ARTIFACT_DIR, desktopFullFile);
        await page.screenshot({ path: fullPublicPath, fullPage: true });
        fs.copyFileSync(fullPublicPath, fullArtifactPath);
        console.log(`✓ Desktop Full Saved: ${desktopFullFile}`);
      }

      await page.close();
    }

    // 2. Mobile Viewport (390 x 844)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 30000 });
      await autoScroll(page);

      const mobileFile = `orbit-3-${pageConfig.name}-mobile-390.png`;
      const publicPath = path.join(PUBLIC_DIR, mobileFile);
      const artifactPath = path.join(ARTIFACT_DIR, mobileFile);

      await page.screenshot({ path: publicPath });
      fs.copyFileSync(publicPath, artifactPath);
      console.log(`✓ Mobile Saved: ${mobileFile}`);

      if (pageConfig.hasFull) {
        const mobileFullFile = `orbit-3-${pageConfig.name}-mobile-full.png`;
        const fullPublicPath = path.join(PUBLIC_DIR, mobileFullFile);
        const fullArtifactPath = path.join(ARTIFACT_DIR, mobileFullFile);
        await page.screenshot({ path: fullPublicPath, fullPage: true });
        fs.copyFileSync(fullPublicPath, fullArtifactPath);
        console.log(`✓ Mobile Full Saved: ${mobileFullFile}`);
      }

      await page.close();
    }
  }

  await browser.close();
  console.log("\n All platform screenshots captured and saved successfully!");
}

captureAllPages().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
