import puppeteer from "puppeteer-core";
import assert from "node:assert";
import path from "node:path";
import fs from "node:fs";

const ARTIFACTS_DIR = "C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

console.log("================================================================================");
console.log("ORBIT BLR 3.2 — Welcome / Sign-In Experience QA & Verification Suite");
console.log("================================================================================\n");

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // 1. Desktop Light Mode Test
    console.log("1. Testing Fresh Visitor Desktop Experience (1440x900)...");
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(BASE_URL, { waitUntil: "networkidle2" });

    // Ensure light mode is active for light screenshot
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
    });
    await new Promise((r) => setTimeout(r, 200));

    // Wait for the Welcome modal dialog to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log("   [PASS] Welcome overlay detected on fresh visit to /");

    // Verify Title and exact copy
    const title = await page.$eval("#welcome-modal-title", (el) => el.textContent?.trim());
    console.log(`   Modal Title: "${title}"`);
    assert.strictEqual(title, "Welcome to ORBIT BLR", "Title must match 'Welcome to ORBIT BLR'");

    const modalText = await page.$eval('[role="dialog"]', (el) => el.innerText);
    assert.ok(modalText.includes("Your gateway to Bengaluru's verified free tech events, developer meetups, and hackathons."), "Subtitle must match");
    assert.ok(modalText.includes("Continue with GitHub"), "Must contain 'Continue with GitHub'");
    assert.ok(modalText.includes("Explore as Guest"), "Must contain 'Explore as Guest'");
    assert.ok(modalText.includes("Sign in to save events, sync your bookmarks, and personalize your experience."), "Must contain supporting text");
    console.log("   [PASS] All copy verified verbatim matching specifications.");

    // Capture Desktop Light Mode Screenshot
    const desktopLightPath = path.join(ARTIFACTS_DIR, "welcome-3-2-desktop-light-1440.png");
    await page.screenshot({ path: desktopLightPath });
    console.log(`   [SCREENSHOT] Saved: welcome-3-2-desktop-light-1440.png`);

    // 2. Desktop Dark Mode Test
    console.log("\n2. Testing Desktop Midnight Violet Dark Mode (1440x900)...");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await new Promise((r) => setTimeout(r, 300));
    const desktopDarkPath = path.join(ARTIFACTS_DIR, "welcome-3-2-desktop-dark-1440.png");
    await page.screenshot({ path: desktopDarkPath });
    console.log(`   [SCREENSHOT] Saved: welcome-3-2-desktop-dark-1440.png`);

    // 3. Mobile Viewport Tests (390x844 - iPhone 14 / modern mobile)
    console.log("\n3. Testing Mobile Viewport Experience (390x844)...");
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    // Mobile Dark Mode
    const mobileDarkPath = path.join(ARTIFACTS_DIR, "welcome-3-2-mobile-dark-390.png");
    await page.screenshot({ path: mobileDarkPath });
    console.log(`   [SCREENSHOT] Saved: welcome-3-2-mobile-dark-390.png`);

    // Mobile Light Mode
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
    });
    await new Promise((r) => setTimeout(r, 300));
    const mobileLightPath = path.join(ARTIFACTS_DIR, "welcome-3-2-mobile-light-390.png");
    await page.screenshot({ path: mobileLightPath });
    console.log(`   [SCREENSHOT] Saved: welcome-3-2-mobile-light-390.png`);

    // 4. Test "Explore as Guest" Dismissal
    console.log("\n4. Testing 'Explore as Guest' Dismissal...");
    // Find button containing "Explore as Guest"
    const exploreBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => b.textContent && b.textContent.includes("Explore as Guest"));
    });
    assert.ok(exploreBtn, "Explore as Guest button must exist");
    await exploreBtn.click();

    // Wait for dialog to disappear
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 3000 });
    console.log("   [PASS] Welcome overlay dismissed smoothly.");

    // Verify sessionStorage has orbit_welcome_dismissed = "true"
    const isDismissedInSession = await page.evaluate(() => sessionStorage.getItem("orbit_welcome_dismissed"));
    assert.strictEqual(isDismissedInSession, "true", "sessionStorage must store orbit_welcome_dismissed='true'");
    console.log("   [PASS] sessionStorage['orbit_welcome_dismissed'] = 'true'");

    // Verify body overflow is unlocked
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    assert.ok(bodyOverflow !== "hidden", "Body overflow must not be locked after dismissal");
    console.log("   [PASS] Body scroll unlocked for seamless browsing.");

    // 5. Test Page Refresh Persistence (No Flash)
    console.log("\n5. Testing Page Refresh Persistence (No Reopening or Flash)...");
    await page.reload({ waitUntil: "networkidle2" });
    const modalAfterReload = await page.$('[role="dialog"]');
    assert.strictEqual(modalAfterReload, null, "Welcome overlay must NOT appear after refresh in the same session!");
    console.log("   [PASS] Confirmed: Guest dismissal persists across page refresh.");

    // 6. Test Navbar Sign In Button for Guests
    console.log("\n6. Testing Navbar 'Sign In' Button functionality for Guests...");
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise((r) => setTimeout(r, 200));
    const navbarSignInBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.find((b) => b.textContent && b.textContent.trim() === "Sign In");
    });
    assert.ok(navbarSignInBtn, "Navbar Sign In button must exist");
    await navbarSignInBtn.click();
    await page.waitForSelector("#signin-modal-title", { timeout: 3000 });
    console.log("   [PASS] Clicking navbar 'Sign In' opens standard sign-in modal for guests.");

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#signin-modal-title"), { timeout: 3000 });
    console.log("   [PASS] Sign-in modal closed successfully.");

    // 7. Test Direct Event Navigation (Uninterrupted)
    console.log("\n7. Testing Direct Event Link Navigation (Uninterrupted Discovery)...");
    const freshPage = await browser.newPage();
    await freshPage.setViewport({ width: 1440, height: 900 });
    // Go directly to event detail page
    await freshPage.goto(`${BASE_URL}/events/hackman-x-2026-dsce-bengaluru`, { waitUntil: "networkidle2" });
    const directModal = await freshPage.$('[role="dialog"]');
    assert.strictEqual(directModal, null, "Welcome overlay must NEVER interrupt direct event links!");
    console.log("   [PASS] Direct event link opened cleanly with zero interruption.");
    await freshPage.close();

    // 8. Test GitHub OAuth Button Initiation
    console.log("\n8. Testing 'Continue with GitHub' OAuth Flow Trigger...");
    const oauthPage = await browser.newPage();
    await oauthPage.setViewport({ width: 1440, height: 900 });
    await oauthPage.goto(BASE_URL, { waitUntil: "networkidle2" });
    await oauthPage.waitForSelector('[role="dialog"]');

    const navPromise = oauthPage.waitForNavigation({ timeout: 8000 }).catch(() => null);
    await oauthPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const btn = btns.find((b) => b.textContent && b.textContent.includes("Continue with GitHub"));
      if (btn) btn.click();
    });
    await navPromise;

    const currentUrl = oauthPage.url();
    console.log(`   Target OAuth URL: ${currentUrl}`);
    assert.ok(
      currentUrl.includes("github.com") || currentUrl.includes("/api/auth"),
      "Must redirect to GitHub OAuth authorization URL or Auth.js sign-in handler"
    );
    console.log("   [PASS] 'Continue with GitHub' successfully initiates genuine OAuth flow.");
    await oauthPage.close();

    console.log("\n================================================================================");
    console.log("ALL 8 WELCOME SCREEN & AUTHENTICATION QA TESTS PASSED WITH 100% SUCCESS!");
    console.log("================================================================================\n");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("QA Test Suite Error:", err);
  process.exit(1);
});
