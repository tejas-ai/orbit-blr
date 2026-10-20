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

async function capture() {
  console.log("Launching Chrome for corrected screenshots...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const eventDetailUrl = `${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`;
  const exploreUrl = `${BASE_URL}/explore`;

  // 1. EVENT DETAIL DESKTOP (1440px)
  {
    console.log("Capturing Event Detail Desktop (1440px)...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(eventDetailUrl, { waitUntil: "networkidle0" });
    await autoScroll(page);

    const filename = "orbit-3-event-detail-desktop-1440.png";
    const pub = path.join(PUBLIC_DIR, filename);
    const art = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: pub });
    fs.copyFileSync(pub, art);
    console.log(`✓ Saved: ${filename}`);
    await page.close();
  }

  // 2. EVENT DETAIL MOBILE (390px)
  {
    console.log("Capturing Event Detail Mobile (390px)...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(eventDetailUrl, { waitUntil: "networkidle0" });
    await autoScroll(page);

    const filename = "orbit-3-event-detail-mobile-390.png";
    const pub = path.join(PUBLIC_DIR, filename);
    const art = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: pub });
    fs.copyFileSync(pub, art);
    console.log(`✓ Saved: ${filename}`);
    await page.close();
  }

  // 3. EXPLORE FILTERS DESKTOP (1440px)
  {
    console.log("Capturing Explore Desktop (1440px)...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(exploreUrl, { waitUntil: "networkidle0" });
    await autoScroll(page);

    const filename = "orbit-3-explore-desktop-1440.png";
    const pub = path.join(PUBLIC_DIR, filename);
    const art = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: pub });
    fs.copyFileSync(pub, art);
    console.log(`✓ Saved: ${filename}`);
    await page.close();
  }

  // 4. EXPLORE FILTERS MOBILE (390px)
  {
    console.log("Capturing Explore Mobile (390px)...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(exploreUrl, { waitUntil: "networkidle0" });
    await autoScroll(page);

    const filename = "orbit-3-explore-mobile-390.png";
    const pub = path.join(PUBLIC_DIR, filename);
    const art = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: pub });
    fs.copyFileSync(pub, art);
    console.log(`✓ Saved: ${filename}`);
    await page.close();
  }

  // Extra Mobile Viewports for QA Check (320px, 375px, 430px)
  for (const w of [320, 375, 430]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(exploreUrl, { waitUntil: "networkidle0" });
    await autoScroll(page);

    const filename = `orbit-3-explore-mobile-${w}.png`;
    const pub = path.join(PUBLIC_DIR, filename);
    const art = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: pub });
    fs.copyFileSync(pub, art);
    console.log(`✓ Saved extra QA viewport: ${filename}`);
    await page.close();
  }

  await browser.close();
  console.log("All corrected screenshots captured successfully!");
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
