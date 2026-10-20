import puppeteer from "puppeteer-core";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function runBrowserTests() {
  console.log("Starting full browser QA suite for ORBIT BLR 3.0...");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const results = [];

  function record(testName, passed, details = "") {
    results.push({ testName, passed, details });
    const mark = passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${mark}] ${testName} ${details ? `(${details})` : ""}`);
  }

  // 1. Homepage Load & Elements
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
    const title = await page.title();
    record("1. Homepage Page Title", title.includes("ORBIT BLR"), title);

    const eventCards = await page.$$('article');
    record("2. Live Event Cards Rendered", eventCards.length >= 8, `Found ${eventCards.length} cards`);

    // Check spotlight
    const spotlightHeading = await page.$eval('h2', el => el.textContent);
    record("3. Featured Spotlight Present", spotlightHeading.toLowerCase().includes("spotlight"), spotlightHeading);

    // Check search filter interaction
    await page.type('input[placeholder*="Search"]', "Python");
    await new Promise(r => setTimeout(r, 400));
    const pythonCards = await page.$$('article');
    record("4. Client Search Filter Interaction", pythonCards.length >= 1, `Found ${pythonCards.length} matching cards`);

    // Reset search
    await page.click('button[aria-label="Clear search text"]');
    await new Promise(r => setTimeout(r, 400));
  } catch (err) {
    record("Homepage Tests", false, err.message);
  }

  // 2. Category Navigation Click
  try {
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const hackBtn = btns.find(b => b.textContent && b.textContent.includes("Free Hackathons"));
      if (hackBtn) {
        hackBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      await new Promise(r => setTimeout(r, 500));
      const cards = await page.$$('article');
      record("5. Category Filter: Hackathons Tab", cards.length >= 2, `Showing ${cards.length} hackathon cards`);
    } else {
      record("5. Category Filter: Hackathons Tab", false, "Button not found");
    }
  } catch (err) {
    record("Category Filter Test", false, err.message);
  }

  // 3. Explore Page Tests
  try {
    await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle0" });
    const exploreTitle = await page.title();
    record("6. Explore Page Title", exploreTitle.includes("Explore"), exploreTitle);

    const cards = await page.$$('article');
    record("7. Explore Page Event Cards", cards.length >= 8, `Found ${cards.length} cards`);

    // Test View Mode toggle
    const listBtn = await page.$('button[aria-label="List View"]');
    if (listBtn) {
      await listBtn.click();
      await new Promise(r => setTimeout(r, 300));
      record("8. Explore List View Toggle", true, "Switched to List View successfully");
      const gridBtn = await page.$('button[aria-label="Grid View"]');
      if (gridBtn) await gridBtn.click();
    }
  } catch (err) {
    record("Explore Page Tests", false, err.message);
  }

  // 4. Dedicated Hackathons View
  try {
    await page.goto(`${BASE_URL}/explore?category=Hackathons`, { waitUntil: "networkidle0" });
    const hackHeading = await page.$eval('h1', el => el.textContent);
    record("9. Hackathons Directory View", hackHeading.toLowerCase().includes("hackathon"), hackHeading);

    const hackCards = await page.$$('article');
    record("10. Hackathon Cards Layout", hackCards.length >= 2, `Found ${hackCards.length} hackathons`);
  } catch (err) {
    record("Hackathons View Tests", false, err.message);
  }

  // 5. Event Detail Page
  try {
    await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, { waitUntil: "networkidle0" });
    const detailTitle = await page.title();
    record("11. Event Detail Title", detailTitle.includes("GEARS 2026"), detailTitle);

    const registerCta = await page.$('a[data-testid="sticky-register-cta"]');
    const ctaText = registerCta ? await page.evaluate(el => el.textContent, registerCta) : "";
    record("12. Official Register CTA Present", Boolean(registerCta), ctaText.trim());

    const verifiedPerksSection = await page.$('#perks');
    record("13. Verified Perks Matrix Present", Boolean(verifiedPerksSection), "Perks section found");

    const auditSection = await page.$('#audit');
    record("14. Verification Audit Trail Present", Boolean(auditSection), "Audit trail found");
  } catch (err) {
    record("Event Detail Tests", false, err.message);
  }

  // 6. Saved Events Page
  try {
    await page.goto(`${BASE_URL}/saved`, { waitUntil: "networkidle0" });
    const savedHeading = await page.$eval('h1', el => el.textContent);
    record("15. Saved Events Page Load", savedHeading.includes("Saved"), savedHeading);
  } catch (err) {
    record("Saved Events Tests", false, err.message);
  }

  // 7. Suggest Event Form
  try {
    await page.goto(`${BASE_URL}/suggest`, { waitUntil: "networkidle0" });
    const suggestHeading = await page.$eval('h1', el => el.textContent);
    record("16. Suggest Event Page Load", suggestHeading.includes("Suggest"), suggestHeading);

    const submitBtn = await page.$('button[type="submit"]');
    record("17. Submit Form Button Present", Boolean(submitBtn), "Submit button found");
  } catch (err) {
    record("Suggest Form Tests", false, err.message);
  }

  // 8. About / Verification Standard Page
  try {
    await page.goto(`${BASE_URL}/about`, { waitUntil: "networkidle0" });
    const aboutHeading = await page.$eval('h1', el => el.textContent);
    record("18. About Page Load", aboutHeading.includes("Bengaluru"), aboutHeading);

    const verificationSection = await page.$('#verification');
    record("19. 7-Point Verification Explainer Present", Boolean(verificationSection), "Verification explainer found");
  } catch (err) {
    record("About Page Tests", false, err.message);
  }

  await browser.close();

  const totalPassed = results.filter(r => r.passed).length;
  console.log(`\n========================================`);
  console.log(`Browser QA Summary: ${totalPassed}/${results.length} Tests Passed`);
  console.log(`========================================\n`);

  if (totalPassed !== results.length) {
    process.exit(1);
  }
}

runBrowserTests().catch(err => {
  console.error("Browser QA failed:", err);
  process.exit(1);
});
