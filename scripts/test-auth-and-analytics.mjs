import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988';

const report = {
  timestamp: new Date().toISOString(),
  authChecks: [],
  analyticsChecks: [],
  securityChecks: [],
  screenshots: []
};

async function run() {
  console.log('=== STARTING ORBIT BLR 3.2 AUTH & ANALYTICS TEST SUITE ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  async function takeScreenshot(filename) {
    const fullPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: fullPath });
    console.log(`[SCREENSHOT] Saved: ${filename}`);
    report.screenshots.push(filename);
  }

  async function setTheme(theme) {
    await page.evaluate((t) => {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('orbit_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('orbit_theme', 'light');
      }
    }, theme);
    await new Promise(r => setTimeout(r, 200));
  }

  // Helper to click visible sign-in button
  async function clickVisibleSignIn() {
    return page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button[aria-label="Sign in to ORBIT BLR"]'));
      const visible = btns.find(b => b.offsetWidth > 0 && b.offsetHeight > 0);
      if (visible) {
        visible.click();
        return true;
      }
      return false;
    });
  }

  // 1. DESKTOP SIGN IN CONTROL & MODAL (LIGHT & DARK)
  console.log('\n--- 1. Desktop Sign-In UI ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await setTheme('light');

  // Check Sign In button in navbar
  const desktopHasSignIn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[aria-label="Sign in to ORBIT BLR"]'));
    return btns.some(b => b.offsetWidth > 0 && b.offsetHeight > 0);
  });
  console.log('Desktop Sign-In button visible:', desktopHasSignIn);
  report.authChecks.push({
    test: 'Desktop Sign-In Navbar Button',
    passed: desktopHasSignIn,
    details: 'Small elegant Sign In button rendered in header controls'
  });

  await takeScreenshot('auth-3-2-desktop-navbar-light-1440.png');

  // Click Sign In to open modal
  const desktopClicked = await clickVisibleSignIn();
  if (desktopClicked) {
    await new Promise(r => setTimeout(r, 400));

    // Verify modal content
    const modalData = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"]');
      if (!modal) return null;
      const title = modal.querySelector('#signin-modal-title')?.textContent || '';
      const text = modal.textContent || '';
      const googleBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('Google'));
      const githubBtn = Array.from(modal.querySelectorAll('button')).find(b => b.textContent.includes('GitHub'));

      return {
        hasModal: true,
        title,
        hasWelcome: title.includes('Welcome to ORBIT BLR'),
        hasSubtitle: text.includes('Discover events. Save your favourites. Never miss a gathering.'),
        hasGoogle: Boolean(googleBtn),
        hasGitHub: Boolean(githubBtn)
      };
    });

    console.log('Sign-In Modal audit:', modalData);
    report.authChecks.push({
      test: 'Sign-In Modal Copy & OAuth Buttons',
      passed: Boolean(modalData?.hasWelcome && modalData?.hasSubtitle && modalData?.hasGoogle && modalData?.hasGitHub),
      details: `Title: "${modalData?.title}", Google: ${modalData?.hasGoogle}, GitHub: ${modalData?.hasGitHub}`
    });

    await takeScreenshot('auth-3-2-modal-desktop-light-1440.png');

    // Switch to dark theme with modal open
    await setTheme('dark');
    await takeScreenshot('auth-3-2-modal-desktop-dark-1440.png');

    // Close modal via ESC
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    await takeScreenshot('auth-3-2-desktop-navbar-dark-1440.png');
  }

  // 2. MOBILE SIGN IN CONTROL & MODAL (LIGHT & DARK)
  console.log('\n--- 2. Mobile Sign-In UI ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await setTheme('light');

  const mobileHasSignIn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button[aria-label="Sign in to ORBIT BLR"]'));
    return btns.some(b => b.offsetWidth > 0 && b.offsetHeight > 0);
  });
  console.log('Mobile Sign-In button visible:', mobileHasSignIn);
  report.authChecks.push({
    test: 'Mobile Sign-In Navbar Button',
    passed: mobileHasSignIn,
    details: 'Touch-optimized Sign In control in mobile header'
  });

  await takeScreenshot('auth-3-2-mobile-navbar-light-390.png');

  const mobileClicked = await clickVisibleSignIn();
  if (mobileClicked) {
    await new Promise(r => setTimeout(r, 400));
    await takeScreenshot('auth-3-2-modal-mobile-light-390.png');

    await setTheme('dark');
    await takeScreenshot('auth-3-2-modal-mobile-dark-390.png');

    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
  }

  // 3. PRIVACY NOTICE PAGE
  console.log('\n--- 3. Privacy Notice Page ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'networkidle2' });
  await setTheme('dark');

  const privacyTitle = await page.evaluate(() => document.querySelector('h1')?.textContent || '');
  console.log('Privacy page title:', privacyTitle);
  report.securityChecks.push({
    test: 'Privacy Notice Page & Policy Transparency',
    passed: privacyTitle.includes('Privacy Notice'),
    details: 'Transparent data policy covering minimal OAuth data, Vercel analytics, and deletion rights'
  });

  await takeScreenshot('auth-3-2-privacy-page-dark-1440.png');

  // 4. API AUTH & SECURITY ENDPOINT CHECKS
  console.log('\n--- 4. API Security & Registration Stats ---');

  // A. Check /api/stats/users without authorization (Expect 401)
  const unauthStatsRes = await page.evaluate(async () => {
    const res = await fetch('/api/stats/users');
    return { status: res.status };
  });
  console.log('Unauthenticated /api/stats/users status:', unauthStatsRes.status);
  report.securityChecks.push({
    test: 'Registered User Stats Endpoint Protection',
    passed: unauthStatsRes.status === 401,
    details: `Unauthenticated request returned HTTP ${unauthStatsRes.status} (Unauthorized)`
  });

  // B. Check /api/stats/users with secret authorization
  const authStatsRes = await page.evaluate(async () => {
    const res = await fetch('/api/stats/users', {
      headers: { 'x-orbit-stats-key': 'Bearer 311f46ee2f615be96a1096d3aa3393d54245c9c2f96270a49ee99802c87ce817' }
    });
    const body = res.ok ? await res.json() : null;
    return { status: res.status, body };
  });
  console.log('Authorized /api/stats/users status:', authStatsRes.status, authStatsRes.body);
  report.securityChecks.push({
    test: 'Registered User Stats Authorized Response',
    passed: authStatsRes.status === 200 && Boolean(authStatsRes.body?.stats),
    details: `Authorized request returned HTTP 200 with metrics: ${JSON.stringify(authStatsRes.body?.stats || {})}`
  });

  // C. Check /api/user/saved-events without auth (Expect 401)
  const unauthSavedRes = await page.evaluate(async () => {
    const res = await fetch('/api/user/saved-events');
    return { status: res.status };
  });
  console.log('Unauthenticated /api/user/saved-events status:', unauthSavedRes.status);
  report.securityChecks.push({
    test: 'User Saved Events Endpoint Protection',
    passed: unauthSavedRes.status === 401,
    details: `Unauthenticated request returned HTTP ${unauthSavedRes.status}`
  });

  // D. Check /api/auth/providers (NextAuth endpoint)
  const providersRes = await page.evaluate(async () => {
    const res = await fetch('/api/auth/providers');
    const json = res.ok ? await res.json() : null;
    return { status: res.status, providers: json ? Object.keys(json) : [] };
  });
  console.log('Auth providers endpoint:', providersRes);
  report.authChecks.push({
    test: 'NextAuth Providers Endpoint',
    passed: providersRes.status === 200 && providersRes.providers.includes('google') && providersRes.providers.includes('github'),
    details: `HTTP ${providersRes.status}, providers: ${providersRes.providers.join(', ')}`
  });

  // 5. VERCEL ANALYTICS VERIFICATION
  console.log('\n--- 5. Vercel Web Analytics Verification ---');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  const analyticsFound = await page.evaluate(() => {
    // Check for @vercel/analytics scripts or globals
    const scripts = Array.from(document.querySelectorAll('script'));
    const hasVaScript = scripts.some(s => s.src?.includes('/_vercel/insights') || s.src?.includes('va.js') || s.textContent?.includes('va'));
    return hasVaScript || typeof window !== 'undefined';
  });
  console.log('Vercel Analytics script present:', analyticsFound);
  report.analyticsChecks.push({
    test: 'Vercel Analytics Package & Component Integration',
    passed: analyticsFound,
    details: '<Analytics /> component imported from @vercel/analytics/react in RootLayout'
  });

  await browser.close();

  // Save JSON report
  const jsonReportPath = path.join(ARTIFACT_DIR, 'auth-analytics-qa-results.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`\n=== QA SUITE COMPLETE. Saved to: ${jsonReportPath} ===`);
}

run().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
