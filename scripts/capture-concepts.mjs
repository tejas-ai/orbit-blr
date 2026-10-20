import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(process.cwd(), "qa-results", "concepts");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

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
      }, 50);
    });
  });
  await new Promise((r) => setTimeout(r, 800));
}

async function capture() {
  console.log("Launching Chrome for concept screenshot capture...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const targets = [
    {
      name: "concept-1-editorial",
      url: `${BASE_URL}/preview/concept-1`,
      title: "Concept 1: Swiss Editorial & Nearify Discovery",
    },
    {
      name: "concept-2-marketplace",
      url: `${BASE_URL}/preview/concept-2`,
      title: "Concept 2: District Modern Event-Marketplace",
    },
  ];

  for (const target of targets) {
    console.log(`\nCapturing ${target.title}...`);

    // 1. Desktop Viewport (1440 x 900)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
      await page.goto(target.url, { waitUntil: "networkidle0", timeout: 30000 });
      await autoScroll(page);

      // Above-the-fold hero & event cards view
      const desktopViewPath = path.join(OUTPUT_DIR, `${target.name}-desktop-1440.png`);
      await page.screenshot({ path: desktopViewPath });
      console.log(`Saved: ${desktopViewPath}`);

      // Full-page scroll screenshot
      const desktopFullPath = path.join(OUTPUT_DIR, `${target.name}-desktop-full.png`);
      await page.screenshot({ path: desktopFullPath, fullPage: true });
      console.log(`Saved: ${desktopFullPath}`);

      await page.close();
    }

    // 2. Mobile Viewport (390 x 844 - iPhone 14)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await page.goto(target.url, { waitUntil: "networkidle0", timeout: 30000 });
      await autoScroll(page);

      const mobileViewPath = path.join(OUTPUT_DIR, `${target.name}-mobile-390.png`);
      await page.screenshot({ path: mobileViewPath });
      console.log(`Saved: ${mobileViewPath}`);

      const mobileFullPath = path.join(OUTPUT_DIR, `${target.name}-mobile-full.png`);
      await page.screenshot({ path: mobileFullPath, fullPage: true });
      console.log(`Saved: ${mobileFullPath}`);

      await page.close();
    }
  }

  await browser.close();
  console.log("\nAll concept screenshots refreshed successfully!");
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
