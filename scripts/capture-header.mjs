import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988";
const PUBLIC_DIR = path.resolve(process.cwd(), "public/screenshots");

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Desktop 1440px
  await page.setViewport({ width: 1440, height: 800, deviceScaleFactor: 2 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  const desktopHeaderPath = path.join(PUBLIC_DIR, "header-clean-desktop-1440.png");
  await page.screenshot({ path: desktopHeaderPath });
  fs.copyFileSync(desktopHeaderPath, path.join(ARTIFACT_DIR, "header-clean-desktop-1440.png"));

  // Mobile 390px
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
  const mobileHeaderPath = path.join(PUBLIC_DIR, "header-clean-mobile-390.png");
  await page.screenshot({ path: mobileHeaderPath });
  fs.copyFileSync(mobileHeaderPath, path.join(ARTIFACT_DIR, "header-clean-mobile-390.png"));

  // Verify that "VERIFIED TECH EXPERIENCES" does NOT exist anywhere in document
  const hasOldBanner = await page.evaluate(() => {
    return document.body.innerText.includes("VERIFIED TECH EXPERIENCES");
  });
  console.log("Has old banner:", hasOldBanner);

  await browser.close();
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
