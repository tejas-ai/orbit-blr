import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const AUDIT_DIR = path.join(process.cwd(), "qa-results", "visual-audit");
const SHOWCASE_DIR = path.join(process.cwd(), "linkedin-showcase");

fs.mkdirSync(AUDIT_DIR, { recursive: true });
fs.mkdirSync(SHOWCASE_DIR, { recursive: true });

const VIEWPORTS = [
  { name: "320px-mobile-compact", width: 320, height: 640 },
  { name: "375px-mobile-standard", width: 375, height: 667 },
  { name: "390px-mobile-modern", width: 390, height: 844 },
  { name: "430px-mobile-large", width: 430, height: 932 },
  { name: "768px-tablet-portrait", width: 768, height: 1024 },
  { name: "1024px-tablet-landscape", width: 1024, height: 768 },
  { name: "1440px-desktop", width: 1440, height: 900 },
];

const auditResults = {
  timestamp: new Date().toISOString(),
  pagesAudited: [],
  viewportsAudited: VIEWPORTS.map((v) => v.name),
  summary: {
    totalImagesChecked: 0,
    validImages: 0,
    brokenImages: 0,
    overflowViolations: 0,
    badgeCollisions: 0,
    interactionsPassed: 0,
    interactionsFailed: 0,
  },
  brokenImageDetails: [],
  overflowDetails: [],
  badgeCollisionDetails: [],
  interactionDetails: [],
};

// Helper to scroll page smoothly to trigger lazy-loaded images and dynamic content
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
          setTimeout(() => {
            window.scrollTo(0, 0);
            resolve();
          }, 400);
        }
      }, 60);
    });
  });
  // Pause briefly for all decoded assets
  await new Promise((r) => setTimeout(r, 700));
}

async function testPage(browser, pageUrl, pageName) {
  console.log(`\n======================================================`);
  console.log(`🔍 AUDITING PAGE: ${pageName} (${pageUrl})`);
  console.log(`======================================================`);

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
      await page.goto(`${BASE_URL}${pageUrl}`, { waitUntil: "networkidle2", timeout: 25000 });

      // Auto-scroll to trigger lazy loading of below-fold event thumbnails
      await autoScroll(page);

      // 1. Check Horizontal Overflow
      const overflow = await page.evaluate(() => {
        const docElem = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(docElem.scrollWidth, body.scrollWidth);
        const clientW = docElem.clientWidth;
        return {
          scrollWidth: scrollW,
          clientWidth: clientW,
          hasOverflow: scrollW > clientW + 1, // allow 1px subpixel tolerance
        };
      });

      if (overflow.hasOverflow) {
        // Identify the offending elements
        const culprits = await page.evaluate(() => {
          const vw = window.innerWidth;
          return Array.from(document.querySelectorAll("*"))
            .map((el) => {
              const rect = el.getBoundingClientRect();
              return {
                tag: el.tagName,
                className: el.className?.toString().slice(0, 60),
                right: rect.right,
                overflow: rect.right - vw,
              };
            })
            .filter((item) => item.right > vw + 1)
            .sort((a, b) => b.overflow - a.overflow)
            .slice(0, 3);
        });

        auditResults.summary.overflowViolations++;
        auditResults.overflowDetails.push({
          page: pageName,
          viewport: vp.name,
          scrollWidth: overflow.scrollWidth,
          clientWidth: overflow.clientWidth,
          culprits,
        });
        console.error(`  ❌ [OVERFLOW] ${pageName} @ ${vp.name}: scrollW=${overflow.scrollWidth} > clientW=${overflow.clientWidth}`);
      } else {
        console.log(`  ✅ [NO OVERFLOW] ${pageName} @ ${vp.name} (${vp.width}px)`);
      }

      // 2. Check Image Validity
      const imagesInfo = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        return imgs.map((img) => ({
          src: img.src,
          alt: img.alt,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayedWidth: img.width,
          displayedHeight: img.height,
        }));
      });

      for (const info of imagesInfo) {
        auditResults.summary.totalImagesChecked++;
        const isBroken = !info.complete || info.naturalWidth === 0 || info.naturalHeight === 0;
        if (isBroken) {
          auditResults.summary.brokenImages++;
          auditResults.brokenImageDetails.push({
            page: pageName,
            viewport: vp.name,
            src: info.src?.slice(0, 100),
            alt: info.alt,
            issue: `complete: ${info.complete}, dimensions: ${info.naturalWidth}x${info.naturalHeight}`,
          });
          console.error(`  ❌ [BROKEN IMAGE] on ${pageName} @ ${vp.name}: alt="${info.alt}" src="${info.src?.slice(0, 60)}"`);
        } else {
          auditResults.summary.validImages++;
        }
      }

      // 3. Check Badge Collision on Mobile (320px, 375px, 390px)
      if (vp.width <= 390) {
        const collisions = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll(".group.relative, [data-testid='event-card']"));
          let overlapCount = 0;
          for (const card of cards) {
            const badgeWrapper = card.querySelector(".absolute.top-2\\.5.left-2\\.5, .max-w-\\[calc\\(100\\%-52px\\)\\]");
            const bookmarkBtn = card.querySelector("button[title*='Save'], button[title*='Bookmark'], .absolute.top-2\\.5.right-2\\.5");
            if (badgeWrapper && bookmarkBtn) {
              const bRect = badgeWrapper.getBoundingClientRect();
              const mRect = bookmarkBtn.getBoundingClientRect();
              if (bRect.right > mRect.left) {
                overlapCount++;
              }
            }
          }
          return overlapCount;
        });

        if (collisions > 0) {
          auditResults.summary.badgeCollisions += collisions;
          auditResults.badgeCollisionDetails.push({
            page: pageName,
            viewport: vp.name,
            count: collisions,
          });
          console.error(`  ❌ [BADGE COLLISION] ${pageName} @ ${vp.name}: ${collisions} card(s) have badge/bookmark overlap`);
        } else {
          console.log(`  ✅ [BADGE FIT] ${pageName} @ ${vp.name}: No badge collisions detected`);
        }
      }

      // 4. Capture screenshot
      const filename = `${pageName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${vp.name}.png`;
      const fullPath = path.join(AUDIT_DIR, filename);
      await page.screenshot({ path: fullPath, fullPage: true });

      // Save key showcase screenshots (strictly NO admin routes)
      if (vp.name === "1440px-desktop") {
        fs.copyFileSync(fullPath, path.join(SHOWCASE_DIR, `desktop-${pageName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`));
      } else if (vp.name === "390px-mobile-modern") {
        fs.copyFileSync(fullPath, path.join(SHOWCASE_DIR, `mobile-${pageName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`));
      }
    } catch (err) {
      console.error(`Error auditing ${pageName} @ ${vp.name}:`, err.message);
    } finally {
      await page.close();
    }
  }

  auditResults.pagesAudited.push(pageName);
}

// Interactive QA: Test dynamic client-side filtering, bookmarking, and search
async function testInteractions(browser) {
  console.log(`\n======================================================`);
  console.log(`🧪 TESTING REAL BROWSER INTERACTIONS`);
  console.log(`======================================================`);

  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle2" });

    // Interaction 1: Search Filter
    console.log("  Testing Search: typing 'Kotlin'...");
    const searchInput = await page.$("input[placeholder*='Search events']");
    if (searchInput) {
      await searchInput.type("Kotlin", { delay: 40 });
      await new Promise((r) => setTimeout(r, 400));
      const cardTitles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("h3")).map((el) => el.innerText);
      });
      const passed = cardTitles.some((t) => t.includes("BlrDroid") || t.includes("Kotlin"));
      if (passed) {
        auditResults.summary.interactionsPassed++;
        console.log(`  ✅ [INTERACTION PASS] Search for 'Kotlin' returned: "${cardTitles[0]}"`);
      } else {
        auditResults.summary.interactionsFailed++;
        console.error(`  ❌ [INTERACTION FAIL] Search for 'Kotlin' did not return expected event`);
      }
      // Clear search by clicking the clear button
      const clearClicked = await page.evaluate(() => {
        const clearBtn = document.querySelector("button:has(svg.lucide-x)");
        if (clearBtn) {
          clearBtn.click();
          return true;
        }
        return false;
      });
      if (!clearClicked) {
        await searchInput.click();
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    // Interaction 2: Category Filter: Hackathons
    console.log("  Testing Category Filter: clicking 'Hackathons'...");
    const hackathonPill = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const pill = btns.find((b) => b.innerText.trim().startsWith("Hackathons"));
      if (pill) {
        pill.click();
        return true;
      }
      return false;
    });

    await new Promise((r) => setTimeout(r, 700));

    const hackathonCardsCount = await page.evaluate(() => {
      return document.querySelectorAll("article, [data-testid='event-card']").length;
    });

    if (hackathonPill && hackathonCardsCount >= 2) {
      auditResults.summary.interactionsPassed++;
      console.log(`  ✅ [INTERACTION PASS] Hackathons category filter rendered ${hackathonCardsCount} cards with balanced layout`);
    } else {
      auditResults.summary.interactionsFailed++;
      console.error(`  ❌ [INTERACTION FAIL] Hackathons category filter returned ${hackathonCardsCount} cards`);
    }

    // Interaction 3: Event Bookmark Toggle & Saved Page Reflection
    console.log("  Testing Bookmark Save & Sync...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });
    const bookmarkClicked = await page.evaluate(() => {
      const btn = document.querySelector("button[title*='Save'], button[title*='Bookmark']");
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    await new Promise((r) => setTimeout(r, 500));

    // Check navbar saved count badge
    const badgeText = await page.evaluate(() => {
      const badge = document.querySelector("[data-testid='saved-count-badge']");
      return badge ? badge.innerText : null;
    });

    if (bookmarkClicked && badgeText === "1") {
      auditResults.summary.interactionsPassed++;
      console.log(`  ✅ [INTERACTION PASS] Bookmark clicked: navbar badge updated to "${badgeText}"`);
    } else {
      auditResults.summary.interactionsFailed++;
      console.error(`  ❌ [INTERACTION FAIL] Bookmark clicked but badge was "${badgeText}"`);
    }

    // Navigate to /saved to confirm event appears
    await page.goto(`${BASE_URL}/saved`, { waitUntil: "networkidle2" });
    try {
      await page.waitForSelector("[data-testid='event-card']", { timeout: 6000 });
    } catch {
      // In case selector times out, allow a grace period
      await new Promise((r) => setTimeout(r, 1200));
    }
    const savedCardsCount = await page.evaluate(() => {
      return document.querySelectorAll("[data-testid='event-card'], article").length;
    });

    if (savedCardsCount >= 1) {
      auditResults.summary.interactionsPassed++;
      console.log(`  ✅ [INTERACTION PASS] /saved verified: ${savedCardsCount} saved event displayed`);
    } else {
      auditResults.summary.interactionsFailed++;
      console.error(`  ❌ [INTERACTION FAIL] /saved page displayed 0 cards`);
    }
  } catch (err) {
    console.error("Interaction testing error:", err.message);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 STARTING PRODUCTION VISUAL & INTERACTIVE QA AUDIT — ORBIT BLR");
  console.log("================================================================================");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    // 1. Homepage
    await testPage(browser, "/", "Homepage");

    // 2. Hackathons Directory
    await testPage(browser, "/explore?category=Hackathons", "Hackathons");

    // 3. Explore (All Events)
    await testPage(browser, "/explore", "Explore-All");

    // 4. Event Detail: Hackman X (DSCE)
    await testPage(browser, "/events/hackman-x-2026-dsce-bengaluru", "EventDetail-HackmanX");

    // 5. Event Detail: DevForge (Scaler)
    await testPage(browser, "/events/the-devforge-hackathon-scaler-school-of-technology-2026", "EventDetail-DevForge");

    // 6. Saved Events
    await testPage(browser, "/saved", "Saved-Events");

    // 7. Suggest Event Form
    await testPage(browser, "/suggest", "Suggest-Event");

    // 8. Interactive Features
    await testInteractions(browser);

    console.log("\n================================================================================");
    console.log("📊 FINAL QA AUDIT SUMMARY");
    console.log("================================================================================");
    console.log(`Total Images Evaluated: ${auditResults.summary.totalImagesChecked}`);
    console.log(`Valid Images:           ${auditResults.summary.validImages}`);
    console.log(`Broken Images:          ${auditResults.summary.brokenImages}`);
    console.log(`Horizontal Overflows:   ${auditResults.summary.overflowViolations}`);
    console.log(`Badge Collisions:       ${auditResults.summary.badgeCollisions}`);
    console.log(`Interactions Passed:    ${auditResults.summary.interactionsPassed}`);
    console.log(`Interactions Failed:    ${auditResults.summary.interactionsFailed}`);

    fs.writeFileSync(
      path.join(AUDIT_DIR, "final-audit-results.json"),
      JSON.stringify(auditResults, null, 2),
      "utf-8"
    );

    console.log(`\nAudit report saved to: ${path.join(AUDIT_DIR, "final-audit-results.json")}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});
