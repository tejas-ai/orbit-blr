import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988';

const VIEWPORTS = [
  { name: 'Mobile 320', width: 320, height: 640 },
  { name: 'Mobile 375', width: 375, height: 667 },
  { name: 'Mobile 390', width: 390, height: 844 },
  { name: 'Mobile 430', width: 430, height: 932 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Desktop 1440', width: 1440, height: 900 }
];

const results = {
  timestamp: new Date().toISOString(),
  viewportResults: [],
  bannerChecks: [],
  screenshots: []
};

async function run() {
  console.log('=== STARTING CLEAN EVENT BANNERS & ASPECT RATIO AUDIT ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. MULTI-VIEWPORT RESPONSIVENESS & OVERFLOW AUDIT
  console.log('\n--- 1. Multi-Viewport Responsiveness & Overflow Test ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    
    const overflowMetrics = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      return {
        hasOverflow: docWidth > winWidth,
        docWidth,
        winWidth
      };
    });

    const passed = !overflowMetrics.hasOverflow;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] Viewport ${vp.name} (${vp.width}px): docWidth=${overflowMetrics.docWidth}, innerWidth=${overflowMetrics.winWidth}`);
    results.viewportResults.push({
      viewport: vp.name,
      width: vp.width,
      passed,
      details: `docWidth: ${overflowMetrics.docWidth}, winWidth: ${overflowMetrics.winWidth}`
    });
  }

  // 2. BANNER OVERLAY AUDIT ON HOMEPAGE
  console.log('\n--- 2. Banner Overlay Audit (Homepage & Cards) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

  const homeBannerCheck = await page.evaluate(() => {
    // Check spotlight image container
    const spotlightContainer = document.querySelector('div[class*="min-h-[200px]"]');
    let spotlightHasOverlays = false;
    if (spotlightContainer) {
      // Look for any absolute elements covering the image
      const absoluteElements = spotlightContainer.querySelectorAll('.absolute');
      spotlightHasOverlays = absoluteElements.length > 0;
    }

    // Check all event card poster containers
    const cards = document.querySelectorAll('article[data-testid="event-card"]');
    let cardsWithOverlays = 0;
    let imagesUsingContain = 0;

    cards.forEach(card => {
      const posterContainer = card.firstElementChild;
      if (posterContainer) {
        const absoluteOverlays = posterContainer.querySelectorAll('.absolute');
        if (absoluteOverlays.length > 0) cardsWithOverlays++;
        const img = posterContainer.querySelector('img');
        if (img) {
          const style = window.getComputedStyle(img);
          if (style.objectFit === 'contain') imagesUsingContain++;
        }
      }
    });

    return {
      totalCards: cards.length,
      cardsWithOverlays,
      imagesUsingContain,
      spotlightHasOverlays
    };
  });

  console.log('Homepage Banner Audit:', homeBannerCheck);
  results.bannerChecks.push({
    test: 'Homepage Cards Zero Overlays',
    passed: homeBannerCheck.cardsWithOverlays === 0,
    details: `${homeBannerCheck.totalCards - homeBannerCheck.cardsWithOverlays}/${homeBannerCheck.totalCards} cards have 0 overlays`
  });
  results.bannerChecks.push({
    test: 'Homepage Cards Use Object-Fit Contain',
    passed: homeBannerCheck.imagesUsingContain === homeBannerCheck.totalCards,
    details: `${homeBannerCheck.imagesUsingContain}/${homeBannerCheck.totalCards} cards use object-fit: contain`
  });
  results.bannerChecks.push({
    test: 'Spotlight Graphic Zero Overlays',
    passed: !homeBannerCheck.spotlightHasOverlays,
    details: homeBannerCheck.spotlightHasOverlays ? 'Found overlays on spotlight' : 'Zero overlays on spotlight artwork'
  });

  // 3. BANNER OVERLAY AUDIT ON EVENT DETAIL PAGE
  console.log('\n--- 3. Banner Overlay Audit (Event Detail Page) ---');
  await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, { waitUntil: 'networkidle0' });

  const detailBannerCheck = await page.evaluate(() => {
    // Media frame is the first child of the banner wrapper
    const mediaFrame = document.querySelector('img[src*="bookmyshow"], img[src*="lumacdn"], img[src*="thumbnails"]')?.parentElement;
    let hasOverlays = false;
    let objectFit = '';
    if (mediaFrame) {
      const absoluteEls = mediaFrame.querySelectorAll('.absolute');
      hasOverlays = absoluteEls.length > 0;
      const img = mediaFrame.querySelector('img');
      if (img) objectFit = window.getComputedStyle(img).objectFit;
    }
    return { hasOverlays, objectFit };
  });

  console.log('Event Detail Banner Audit:', detailBannerCheck);
  results.bannerChecks.push({
    test: 'Event Detail Hero Zero Overlays',
    passed: !detailBannerCheck.hasOverlays,
    details: detailBannerCheck.hasOverlays ? 'Found overlays on hero banner' : 'Hero banner is 100% clean with zero overlays'
  });
  results.bannerChecks.push({
    test: 'Event Detail Hero Uses Object-Fit Contain',
    passed: detailBannerCheck.objectFit === 'contain',
    details: `object-fit is ${detailBannerCheck.objectFit}`
  });

  // 4. SCREENSHOTS GENERATION (Light & Dark, Desktop & Mobile)
  console.log('\n--- 4. Capturing High-Res Screenshots ---');

  // 4A: Homepage Desktop Light (1440px)
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const shot1 = path.join(ARTIFACT_DIR, 'clean-banner-home-desktop-light-1440.png');
  await page.screenshot({ path: shot1, fullPage: false });
  console.log('✓ Captured:', shot1);

  // 4B: Homepage Desktop Dark (1440px)
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const shot2 = path.join(ARTIFACT_DIR, 'clean-banner-home-desktop-dark-1440.png');
  await page.screenshot({ path: shot2, fullPage: false });
  console.log('✓ Captured:', shot2);

  // 4C: Explore Desktop Dark (1440px)
  await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle0' });
  const shot3 = path.join(ARTIFACT_DIR, 'clean-banner-explore-desktop-dark-1440.png');
  await page.screenshot({ path: shot3, fullPage: false });
  console.log('✓ Captured:', shot3);

  // 4D: Event Details Desktop Light (1440px)
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, { waitUntil: 'networkidle0' });
  const shot4 = path.join(ARTIFACT_DIR, 'clean-banner-event-detail-desktop-light-1440.png');
  await page.screenshot({ path: shot4, fullPage: false });
  console.log('✓ Captured:', shot4);

  // 4E: Event Details Desktop Dark (1440px)
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, { waitUntil: 'networkidle0' });
  const shot5 = path.join(ARTIFACT_DIR, 'clean-banner-event-detail-desktop-dark-1440.png');
  await page.screenshot({ path: shot5, fullPage: false });
  console.log('✓ Captured:', shot5);

  // 4F: Homepage Mobile Light (390px)
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const shot6 = path.join(ARTIFACT_DIR, 'clean-banner-home-mobile-light-390.png');
  await page.screenshot({ path: shot6, fullPage: false });
  console.log('✓ Captured:', shot6);

  // 4G: Homepage Mobile Dark (390px)
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
  const shot7 = path.join(ARTIFACT_DIR, 'clean-banner-home-mobile-dark-390.png');
  await page.screenshot({ path: shot7, fullPage: false });
  console.log('✓ Captured:', shot7);

  // 4H: Event Details Mobile Dark (390px)
  await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, { waitUntil: 'networkidle0' });
  const shot8 = path.join(ARTIFACT_DIR, 'clean-banner-event-detail-mobile-dark-390.png');
  await page.screenshot({ path: shot8, fullPage: false });
  console.log('✓ Captured:', shot8);

  // 5. TEST INTERACTIVE CONTROLS
  console.log('\n--- 5. Interactive Controls & Registration Link Check ---');
  const ctaCheck = await page.evaluate(() => {
    const cta = document.querySelector('[data-testid="sticky-register-cta"]');
    return {
      exists: !!cta,
      target: cta?.getAttribute('target'),
      rel: cta?.getAttribute('rel'),
      href: cta?.getAttribute('href')
    };
  });
  console.log('Registration CTA check:', ctaCheck);

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'clean-banners-audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log('\n=== AUDIT COMPLETE ===');
  console.log('Results saved to clean-banners-audit-results.json');
}

run().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
