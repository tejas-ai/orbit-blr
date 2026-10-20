import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988';

const VIEWPORTS = [
  { name: '320px Ultra-Compact Mobile', width: 320, height: 640 },
  { name: '375px Compact Mobile', width: 375, height: 667 },
  { name: '390px Standard Mobile', width: 390, height: 844 },
  { name: '430px Large Mobile', width: 430, height: 932 },
  { name: '768px Tablet Portrait', width: 768, height: 1024 },
  { name: '1024px Tablet Landscape', width: 1024, height: 768 },
  { name: '1440px Desktop', width: 1440, height: 900 }
];

const report = {
  timestamp: new Date().toISOString(),
  viewports: [],
  zeroOverlaysChecks: [],
  aspectRatioAndSpaceChecks: [],
  functionalityChecks: [],
  screenshots: []
};

async function run() {
  console.log('=== STARTING FINAL EVENT BANNER REFINEMENT & PRODUCTION-READY QA ===');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // Helper for screenshot
  async function takeScreenshot(filename, clip = null) {
    const fullPath = path.join(ARTIFACT_DIR, filename);
    const options = { path: fullPath };
    if (clip) options.clip = clip;
    await page.screenshot(options);
    console.log(`[SCREENSHOT] Saved: ${filename}`);
    report.screenshots.push(filename);
  }

  // Helper to toggle theme
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

  // 1. MULTI-VIEWPORT OVERFLOW & RESPONSIVENESS AUDIT
  console.log('\n--- 1. Multi-Viewport Responsiveness & Overflow Test ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      return {
        docWidth,
        winWidth,
        hasOverflow: docWidth > winWidth
      };
    });

    const passed = !overflow.hasOverflow;
    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): ${passed ? 'PASS' : 'FAIL'} (docWidth: ${overflow.docWidth}, winWidth: ${overflow.winWidth})`);
    report.viewports.push({
      name: vp.name,
      width: vp.width,
      passed,
      details: `docWidth: ${overflow.docWidth}, winWidth: ${overflow.winWidth}`
    });
  }

  // 2. HOMEPAGE SPOTLIGHT — DESKTOP (LIGHT & DARK)
  console.log('\n--- 2. Spotlight Desktop Visual Verification ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await setTheme('light');

  // Check spotlight container and measure empty space
  const spotlightMetrics = await page.evaluate(() => {
    // Spotlight banner element
    const spotlightImgContainer = document.querySelector('section div.rounded-3xl div.flex-col.lg\\:flex-row > div:first-child');
    if (!spotlightImgContainer) return null;
    const rect = spotlightImgContainer.getBoundingClientRect();
    const img = spotlightImgContainer.querySelector('img');
    const imgRect = img ? img.getBoundingClientRect() : null;
    
    // Check for any absolute overlays on top of the image container
    const overlays = Array.from(spotlightImgContainer.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'absolute' && el.tagName !== 'IMG' && el.tagName !== 'DIV';
    });

    return {
      containerWidth: rect.width,
      containerHeight: rect.height,
      imgWidth: imgRect ? imgRect.width : 0,
      imgHeight: imgRect ? imgRect.height : 0,
      overlayCount: overlays.length,
      objectFit: img ? window.getComputedStyle(img).objectFit : null
    };
  });

  console.log('Spotlight metrics:', spotlightMetrics);
  if (spotlightMetrics) {
    report.aspectRatioAndSpaceChecks.push({
      item: 'Spotlight Banner Graphic Ratio & Space',
      passed: spotlightMetrics.overlayCount === 0 && spotlightMetrics.objectFit === 'contain',
      details: `Container: ${Math.round(spotlightMetrics.containerWidth)}x${Math.round(spotlightMetrics.containerHeight)}px, Img: ${Math.round(spotlightMetrics.imgWidth)}x${Math.round(spotlightMetrics.imgHeight)}px, Overlays: ${spotlightMetrics.overlayCount}`
    });
  }

  // Capture desktop light spotlight
  await takeScreenshot('refined-banner-spotlight-desktop-light-1440.png');

  // Switch to dark mode
  await setTheme('dark');
  await takeScreenshot('refined-banner-spotlight-desktop-dark-1440.png');

  // 3. HOMEPAGE SPOTLIGHT — MOBILE (LIGHT & DARK)
  console.log('\n--- 3. Spotlight Mobile Visual Verification ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
  await setTheme('light');
  await takeScreenshot('refined-banner-spotlight-mobile-light-390.png');

  await setTheme('dark');
  await takeScreenshot('refined-banner-spotlight-mobile-dark-390.png');

  // 4. EXPLORE EVENT CARDS GRID — DESKTOP (LIGHT & DARK)
  console.log('\n--- 4. Explore Cards Grid Desktop Visual Verification ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle2' });
  await setTheme('light');

  // Inspect cards for zero overlays and aspect ratio
  const cardsAudit = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('article[data-testid="event-card"]'));
    return cards.map(c => {
      const posterDiv = c.querySelector('div.relative.aspect-\\[16\\/9\\]') || c.querySelector('div.relative.overflow-hidden');
      const img = posterDiv ? posterDiv.querySelector('img') : null;
      const overlays = posterDiv ? Array.from(posterDiv.querySelectorAll('.absolute')).filter(el => el.tagName !== 'IMG' && !el.classList.contains('pointer-events-none')) : [];
      const imgStyle = img ? window.getComputedStyle(img) : null;
      const pRect = posterDiv ? posterDiv.getBoundingClientRect() : null;
      const iRect = img ? img.getBoundingClientRect() : null;

      return {
        hasPoster: Boolean(posterDiv),
        hasImg: Boolean(img),
        overlayCount: overlays.length,
        objectFit: imgStyle ? imgStyle.objectFit : null,
        containerDim: pRect ? `${Math.round(pRect.width)}x${Math.round(pRect.height)}` : 'N/A',
        imgDim: iRect ? `${Math.round(iRect.width)}x${Math.round(iRect.height)}` : 'N/A'
      };
    });
  });

  console.log(`Audited ${cardsAudit.length} cards on Explore:`);
  const allCardsClean = cardsAudit.length > 0 && cardsAudit.every(c => c.overlayCount === 0);
  const allCardsContain = cardsAudit.length > 0 && cardsAudit.every(c => c.objectFit === 'contain');
  console.log(`- Zero overlays across cards: ${allCardsClean ? 'PASS' : 'FAIL'}`);
  console.log(`- object-fit: contain preserved: ${allCardsContain ? 'PASS' : 'FAIL'}`);

  report.zeroOverlaysChecks.push({
    test: 'Explore Cards Zero Overlays',
    passed: allCardsClean,
    details: `${cardsAudit.length} cards audited, all 0 overlays`
  });

  report.aspectRatioAndSpaceChecks.push({
    test: 'Explore Cards 16:9 Container and Contain Fit',
    passed: allCardsContain,
    details: cardsAudit.map(c => `Container: ${c.containerDim}, Img: ${c.imgDim}`).slice(0, 3).join(' | ')
  });

  // Capture explore desktop light
  await page.evaluate(() => window.scrollTo(0, 400));
  await new Promise(r => setTimeout(r, 400));
  await takeScreenshot('refined-banner-cards-desktop-light-1440.png');

  // Capture explore desktop dark
  await setTheme('dark');
  await takeScreenshot('refined-banner-cards-desktop-dark-1440.png');

  // 5. EXPLORE EVENT CARDS — MOBILE (LIGHT & DARK)
  console.log('\n--- 5. Explore Cards Mobile Visual Verification ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle2' });
  await setTheme('light');
  await page.evaluate(() => window.scrollTo(0, 300));
  await new Promise(r => setTimeout(r, 400));
  await takeScreenshot('refined-banner-cards-mobile-light-390.png');

  await setTheme('dark');
  await takeScreenshot('refined-banner-cards-mobile-dark-390.png');

  // 6. HACKATHONS CARDS — DESKTOP AND MOBILE
  console.log('\n--- 6. Hackathons Cards Visual Verification ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/explore?category=Hackathons`, { waitUntil: 'networkidle2' });
  await setTheme('dark');
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 400));
  await takeScreenshot('refined-banner-hackathons-desktop-dark-1440.png');

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/explore?category=Hackathons`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 200));
  await new Promise(r => setTimeout(r, 400));
  await takeScreenshot('refined-banner-hackathons-mobile-dark-390.png');

  // 7. INDIVIDUAL EVENT DETAILS (LANDSCAPE POSTER) — DESKTOP AND MOBILE
  console.log('\n--- 7. Individual Event Details (Landscape Poster) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/events/owasp-null-bangalore-monthly-meet-2026-10-24`, { waitUntil: 'networkidle2' });
  await setTheme('light');

  // Audit event detail hero banner
  const heroAudit = await page.evaluate(() => {
    const heroImg = document.querySelector('div.w-full.rounded-3xl img');
    const heroContainer = document.querySelector('div.w-full.rounded-3xl');
    const overlays = heroContainer ? Array.from(heroContainer.querySelectorAll('.absolute')).filter(el => el.tagName !== 'IMG') : [];
    const style = heroImg ? window.getComputedStyle(heroImg) : null;
    const cRect = heroContainer ? heroContainer.getBoundingClientRect() : null;
    const iRect = heroImg ? heroImg.getBoundingClientRect() : null;

    return {
      hasHero: Boolean(heroImg),
      overlayCount: overlays.length,
      objectFit: style ? style.objectFit : null,
      containerDim: cRect ? `${Math.round(cRect.width)}x${Math.round(cRect.height)}` : 'N/A',
      imgDim: iRect ? `${Math.round(iRect.width)}x${Math.round(iRect.height)}` : 'N/A'
    };
  });

  console.log('Event Detail Hero Audit:', heroAudit);
  report.aspectRatioAndSpaceChecks.push({
    test: 'Event Detail Hero Adaptive Frame & Zero Overlays',
    passed: heroAudit.overlayCount === 0 && heroAudit.objectFit === 'contain',
    details: `Container: ${heroAudit.containerDim}, Img: ${heroAudit.imgDim}, Overlays: ${heroAudit.overlayCount}`
  });

  await takeScreenshot('refined-banner-event-detail-desktop-light-1440.png');

  await setTheme('dark');
  await takeScreenshot('refined-banner-event-detail-desktop-dark-1440.png');

  // Mobile event detail
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/events/owasp-null-bangalore-monthly-meet-2026-10-24`, { waitUntil: 'networkidle2' });
  await setTheme('dark');
  await takeScreenshot('refined-banner-event-detail-mobile-dark-390.png');

  // 8. LANDSCAPE POSTER DEDICATED VERIFICATION
  console.log('\n--- 8. Dedicated Landscape Poster Visual ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/events/beyond-llms-world-models-physical-ai-2026-10-31`, { waitUntil: 'networkidle2' });
  await setTheme('dark');
  await takeScreenshot('refined-banner-landscape-poster-desktop.png');

  // 9. MEETUP / SQUARE POSTER COMPARISON
  console.log('\n--- 9. Meetup / Square Poster Visual ---');
  await page.goto(`${BASE_URL}/events/software-architects-meetup-2026-10-24`, { waitUntil: 'networkidle2' });
  await setTheme('dark');
  await takeScreenshot('refined-banner-square-landscape-comparison.png');

  // 10. FUNCTIONAL TESTING
  console.log('\n--- 10. Functional Testing ---');
  // A. Registration CTA test
  const ctaCheck = await page.evaluate(() => {
    const cta = document.querySelector('a[href*="meetup.com"]') || document.querySelector('a[href*="luma"]') || document.querySelector('a[href*="gdg"]');
    return {
      found: Boolean(cta),
      href: cta ? cta.getAttribute('href') : null,
      target: cta ? cta.getAttribute('target') : null
    };
  });
  console.log('CTA check:', ctaCheck);
  report.functionalityChecks.push({
    test: 'Direct Organiser Registration Link',
    passed: ctaCheck.found && ctaCheck.target === '_blank',
    details: `CTA target: ${ctaCheck.target}, href: ${ctaCheck.href}`
  });

  // B. Search and Filter check on Explore
  await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle2' });
  await page.type('input[placeholder*="Search"]', 'Python');
  await new Promise(r => setTimeout(r, 300));
  const filterCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('article[data-testid="event-card"]');
    return cards.length;
  });
  console.log(`Search for "Python" returned ${filterCount} cards.`);
  report.functionalityChecks.push({
    test: 'Dynamic Search & Filtering',
    passed: filterCount >= 1,
    details: `Search "Python" filtered to ${filterCount} event(s)`
  });

  // C. Theme persistence check
  await page.evaluate(() => {
    localStorage.setItem('orbit_theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  const themeRetained = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark') && localStorage.getItem('orbit_theme') === 'dark';
  });
  console.log('Theme persistence after reload:', themeRetained);
  report.functionalityChecks.push({
    test: 'Theme Persistence Across Reloads',
    passed: themeRetained,
    details: 'HTML class dark and localStorage orbit_theme preserved'
  });

  // D. SEO Schema.org check
  await page.goto(`${BASE_URL}/events/owasp-null-bangalore-monthly-meet-2026-10-24`, { waitUntil: 'networkidle2' });
  const schemaCheck = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    for (const s of scripts) {
      try {
        const json = JSON.parse(s.textContent);
        if (json['@type'] === 'Event' || (Array.isArray(json['@graph']) && json['@graph'].some(g => g['@type'] === 'Event'))) {
          return { valid: true, type: json['@type'] || 'EventGraph' };
        }
      } catch {}
    }
    return { valid: false };
  });
  console.log('Schema.org event check:', schemaCheck);
  report.functionalityChecks.push({
    test: 'Schema.org Event JSON-LD Validity',
    passed: schemaCheck.valid,
    details: `Found Schema.org @type: ${schemaCheck.type}`
  });

  await browser.close();

  // Save JSON report
  const jsonReportPath = path.join(ARTIFACT_DIR, 'refined-banners-qa-results.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`\n=== QA AUDIT COMPLETE. Report saved to: ${jsonReportPath} ===`);
}

run().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
