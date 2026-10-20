import puppeteer from "puppeteer-core";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function verifyUIMetrics() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  console.log("Checking Event Detail layout metrics...");
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, { waitUntil: "networkidle0" });

    // Check banner image bounding box vs title bounding box
    const imgRect = await page.$eval('div.aspect-\\[21\\/9\\] img', el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    });

    const titleRect = await page.$eval('h1', el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height, text: el.textContent };
    });

    console.log(`Banner bottom: ${imgRect.bottom}px, Title top: ${titleRect.top}px`);
    const isSeparated = titleRect.top >= imgRect.bottom;
    console.log(`[${isSeparated ? "PASS" : "FAIL"}] Title is completely outside and below banner: ${isSeparated}`);
    console.log(`Title text: "${titleRect.text}"`);

    await page.close();
  }

  console.log("\nChecking Mobile Explore Filter metrics across viewports...");
  for (const w of [320, 375, 390, 430]) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 800 });
    await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle0" });

    // Check search width
    const searchWidth = await page.$eval('input[placeholder*="Search"]', el => el.getBoundingClientRect().width);

    // Check select dropdowns width and text visibility
    const areaSelect = await page.$eval('select[aria-label="Filter by Bengaluru neighborhood"]', el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, value: el.options[el.selectedIndex].text };
    });

    const sortSelect = await page.$eval('select[aria-label="Sort events"]', el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, value: el.options[el.selectedIndex].text };
    });

    console.log(`[Viewport ${w}px] Search Width: ${searchWidth.toFixed(1)}px`);
    console.log(`  Area Control Width: ${areaSelect.width.toFixed(1)}px, Label: "${areaSelect.value}"`);
    console.log(`  Sort Control Width: ${sortSelect.width.toFixed(1)}px, Label: "${sortSelect.value}"`);

    await page.close();
  }

  await browser.close();
  console.log("\nUI Metrics Verification completed successfully!");
}

verifyUIMetrics().catch(err => {
  console.error(err);
  process.exit(1);
});
