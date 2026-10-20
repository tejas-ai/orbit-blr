import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUBLIC_DIR = path.join(process.cwd(), "public", "screenshots");
const QA_DIR = path.join(process.cwd(), "qa-results", "concepts");

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.mkdirSync(QA_DIR, { recursive: true });

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
  await new Promise((r) => setTimeout(r, 1000));
}

async function captureHybrid() {
  console.log("Launching Chrome for Hybrid Homepage capture...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const url = `${BASE_URL}/preview/hybrid`;

  // 1. Desktop Viewport (1440 x 900)
  {
    console.log("Capturing Desktop Viewport (1440px)...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await autoScroll(page);

    const desktop1440Public = path.join(PUBLIC_DIR, "hybrid-desktop-1440.png");
    const desktop1440QA = path.join(QA_DIR, "hybrid-desktop-1440.png");
    await page.screenshot({ path: desktop1440Public });
    fs.copyFileSync(desktop1440Public, desktop1440QA);
    console.log(`Saved: ${desktop1440Public}`);

    const desktopFullPublic = path.join(PUBLIC_DIR, "hybrid-desktop-full.png");
    const desktopFullQA = path.join(QA_DIR, "hybrid-desktop-full.png");
    await page.screenshot({ path: desktopFullPublic, fullPage: true });
    fs.copyFileSync(desktopFullPublic, desktopFullQA);
    console.log(`Saved: ${desktopFullPublic}`);

    await page.close();
  }

  // 2. Mobile Viewport (390 x 844 - iPhone 14)
  {
    console.log("Capturing Mobile Viewport (390px)...");
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await autoScroll(page);

    const mobile390Public = path.join(PUBLIC_DIR, "hybrid-mobile-390.png");
    const mobile390QA = path.join(QA_DIR, "hybrid-mobile-390.png");
    await page.screenshot({ path: mobile390Public });
    fs.copyFileSync(mobile390Public, mobile390QA);
    console.log(`Saved: ${mobile390Public}`);

    const mobileFullPublic = path.join(PUBLIC_DIR, "hybrid-mobile-full.png");
    const mobileFullQA = path.join(QA_DIR, "hybrid-mobile-full.png");
    await page.screenshot({ path: mobileFullPublic, fullPage: true });
    fs.copyFileSync(mobileFullPublic, mobileFullQA);
    console.log(`Saved: ${mobileFullPublic}`);

    await page.close();
  }

  await browser.close();
  console.log("All Hybrid screenshots saved to public/screenshots/ successfully!");
}

captureHybrid().catch((err) => {
  console.error("Hybrid capture failed:", err);
  process.exit(1);
});
