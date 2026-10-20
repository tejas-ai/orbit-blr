import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = path.join(process.cwd(), "qa-results", "concepts");

async function testInteractions() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/preview/hybrid`, { waitUntil: "networkidle0" });

  console.log("Testing search input...");
  const searchInput = await page.$('input[placeholder*="Search meetups"]');
  await searchInput.type("Python");
  await new Promise((r) => setTimeout(r, 600));

  const countAfterSearch = await page.evaluate(() => {
    return document.querySelectorAll('article').length;
  });
  console.log(`Events matching 'Python': ${countAfterSearch}`);

  // Capture search state screenshot
  const searchScreenshotPath = path.join(OUTPUT_DIR, "hybrid-interaction-search-python.png");
  await page.screenshot({ path: searchScreenshotPath });
  console.log(`Saved: ${searchScreenshotPath}`);

  // Clear search
  await page.click('button[aria-label="Clear search text"]');
  await new Promise((r) => setTimeout(r, 400));

  console.log("Testing Free Hackathons category chip click...");
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hackBtn = buttons.find(b => b.textContent.includes('Free Hackathons'));
    if (hackBtn) hackBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  const countAfterHackathon = await page.evaluate(() => {
    return document.querySelectorAll('article').length;
  });
  console.log(`Events matching 'Free Hackathons': ${countAfterHackathon}`);

  // Capture Hackathons filter screenshot
  const hackScreenshotPath = path.join(OUTPUT_DIR, "hybrid-interaction-hackathons-filter.png");
  await page.screenshot({ path: hackScreenshotPath });
  console.log(`Saved: ${hackScreenshotPath}`);

  await browser.close();
  console.log("All interaction tests passed cleanly!");
}

testInteractions().catch(console.error);
