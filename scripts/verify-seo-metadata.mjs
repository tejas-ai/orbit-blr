import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const EXPECTED_DOMAIN = "https://orbit-blr.vercel.app";
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const tests = [];

function record(name, pass, details = "") {
  tests.push({ name, pass, details });
  console.log(`${pass ? "[✓ PASS]" : "[✗ FAIL]"} ${name} ${details ? "- " + details : ""}`);
}

async function verifySeo() {
  console.log("\n=================================================");
  console.log("ORBIT BLR 3.0 — SEO & METADATA AUDIT SUITE");
  console.log("=================================================\n");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 1. Homepage Metadata Audit
  console.log("--- 1. Homepage Metadata Audit ---");
  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle2" });

  const homeMeta = await page.evaluate(() => {
    const getMeta = (prop, isName = false) => {
      const el = isName
        ? document.querySelector(`meta[name="${prop}"]`)
        : document.querySelector(`meta[property="${prop}"]`);
      return el ? el.getAttribute("content") : null;
    };
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");

    return {
      title: document.title,
      description: getMeta("description", true),
      ogTitle: getMeta("og:title"),
      ogDescription: getMeta("og:description"),
      ogUrl: getMeta("og:url"),
      ogImage: getMeta("og:image"),
      twitterCard: getMeta("twitter:card", true),
      twitterTitle: getMeta("twitter:title", true),
      twitterImage: getMeta("twitter:image", true),
      canonical,
    };
  });

  record(
    "Homepage Title",
    homeMeta.title === "ORBIT BLR — Discover Free Tech Events & Hackathons in Bengaluru",
    `"${homeMeta.title}"`
  );
  record(
    "Homepage Description",
    homeMeta.description?.includes("Discover independently verified free tech meetups"),
    `"${homeMeta.description?.slice(0, 70)}..."`
  );
  record(
    "Homepage Canonical URL",
    homeMeta.canonical === `${EXPECTED_DOMAIN}/` || homeMeta.canonical === `${EXPECTED_DOMAIN}`,
    `Canonical: ${homeMeta.canonical}`
  );
  record(
    "Homepage Open Graph URL (og:url)",
    homeMeta.ogUrl === `${EXPECTED_DOMAIN}/` || homeMeta.ogUrl === `${EXPECTED_DOMAIN}`,
    `og:url: ${homeMeta.ogUrl}`
  );
  record(
    "Homepage Open Graph Title (og:title)",
    homeMeta.ogTitle === "ORBIT BLR — Discover Free Tech Events & Hackathons in Bengaluru",
    `og:title: "${homeMeta.ogTitle}"`
  );
  record(
    "Homepage Open Graph Image (og:image)",
    homeMeta.ogImage?.includes("/og-image.png"),
    `og:image: ${homeMeta.ogImage}`
  );
  record(
    "Homepage Twitter Card (twitter:card)",
    homeMeta.twitterCard === "summary_large_image",
    `card: ${homeMeta.twitterCard}`
  );
  record(
    "Zero 'orbitblr.in' in Homepage HTML",
    !(await page.content()).includes("orbitblr.in"),
    "No legacy domain in HTML"
  );

  // 2. Explore Page Canonical & Metadata
  console.log("\n--- 2. Explore Directory Metadata ---");
  await page.goto(`${BASE_URL}/explore`, { waitUntil: "networkidle2" });
  const exploreMeta = await page.evaluate(() => {
    return {
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
    };
  });
  record(
    "Explore Canonical URL",
    exploreMeta.canonical === `${EXPECTED_DOMAIN}/explore`,
    `Canonical: ${exploreMeta.canonical}`
  );
  record(
    "Explore Open Graph URL",
    exploreMeta.ogUrl === `${EXPECTED_DOMAIN}/explore`,
    `og:url: ${exploreMeta.ogUrl}`
  );

  // 3. About Page Canonical & Metadata
  console.log("\n--- 3. About Page Metadata ---");
  await page.goto(`${BASE_URL}/about`, { waitUntil: "networkidle2" });
  const aboutMeta = await page.evaluate(() => {
    return {
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
    };
  });
  record(
    "About Canonical URL",
    aboutMeta.canonical === `${EXPECTED_DOMAIN}/about`,
    `Canonical: ${aboutMeta.canonical}`
  );

  // 4. Saved & Suggest Utility Pages (Noindex Check)
  console.log("\n--- 4. Utility Pages (Saved & Suggest) ---");
  await page.goto(`${BASE_URL}/saved`, { waitUntil: "networkidle2" });
  const savedMeta = await page.evaluate(() => {
    return {
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    };
  });
  record(
    "Saved Events Robots (noindex)",
    savedMeta.robots?.includes("noindex"),
    `robots: "${savedMeta.robots}"`
  );
  record(
    "Saved Events Canonical URL",
    savedMeta.canonical === `${EXPECTED_DOMAIN}/saved`,
    `Canonical: ${savedMeta.canonical}`
  );

  await page.goto(`${BASE_URL}/suggest`, { waitUntil: "networkidle2" });
  const suggestMeta = await page.evaluate(() => {
    return {
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    };
  });
  record(
    "Suggest Event Robots (noindex)",
    suggestMeta.robots?.includes("noindex"),
    `robots: "${suggestMeta.robots}"`
  );
  record(
    "Suggest Event Canonical URL",
    suggestMeta.canonical === `${EXPECTED_DOMAIN}/suggest`,
    `Canonical: ${suggestMeta.canonical}`
  );

  // 5. Dynamic Event Detail Metadata & JSON-LD
  console.log("\n--- 5. Dynamic Event Detail (GEARS 2026) ---");
  await page.goto(`${BASE_URL}/events/gears-2026-global-higher-education-ai-readiness-summit`, {
    waitUntil: "networkidle2",
  });
  const eventDetailData = await page.evaluate(() => {
    const getMeta = (prop, isName = false) => {
      const el = isName
        ? document.querySelector(`meta[name="${prop}"]`)
        : document.querySelector(`meta[property="${prop}"]`);
      return el ? el.getAttribute("content") : null;
    };
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    const jsonLd = jsonLdScript ? JSON.parse(jsonLdScript.textContent) : null;

    return {
      title: document.title,
      canonical,
      ogUrl: getMeta("og:url"),
      ogImage: getMeta("og:image"),
      twitterImage: getMeta("twitter:image", true),
      jsonLd,
    };
  });

  record(
    "Event Detail Title",
    eventDetailData.title?.includes("GEARS 2026"),
    `Title: "${eventDetailData.title}"`
  );
  record(
    "Event Detail Canonical URL",
    eventDetailData.canonical === `${EXPECTED_DOMAIN}/events/gears-2026-global-higher-education-ai-readiness-summit`,
    `Canonical: ${eventDetailData.canonical}`
  );
  record(
    "Event Detail Open Graph URL (og:url)",
    eventDetailData.ogUrl === `${EXPECTED_DOMAIN}/events/gears-2026-global-higher-education-ai-readiness-summit`,
    `og:url: ${eventDetailData.ogUrl}`
  );
  record(
    "Event Detail OG Image is Raster (PNG/JPG, not SVG)",
    eventDetailData.ogImage && !eventDetailData.ogImage.endsWith(".svg") && eventDetailData.ogImage.endsWith(".png"),
    `og:image: ${eventDetailData.ogImage}`
  );
  record(
    "Event Detail Schema.org Type is Event",
    eventDetailData.jsonLd?.["@type"] === "Event",
    `@type: ${eventDetailData.jsonLd?.["@type"]}`
  );
  record(
    "Event Detail Schema.org isAccessibleForFree",
    eventDetailData.jsonLd?.isAccessibleForFree === true,
    `isAccessibleForFree: ${eventDetailData.jsonLd?.isAccessibleForFree}`
  );
  record(
    "Event Detail Schema.org Canonical URL",
    eventDetailData.jsonLd?.url === `${EXPECTED_DOMAIN}/events/gears-2026-global-higher-education-ai-readiness-summit`,
    `url: ${eventDetailData.jsonLd?.url}`
  );
  record(
    "Event Detail Schema.org Offers Price 0",
    eventDetailData.jsonLd?.offers?.price === "0" && eventDetailData.jsonLd?.offers?.priceCurrency === "INR",
    `Offer: ₹${eventDetailData.jsonLd?.offers?.price} ${eventDetailData.jsonLd?.offers?.priceCurrency}`
  );
  record(
    "Open Event Schema.org Availability is InStock",
    eventDetailData.jsonLd?.offers?.availability === "https://schema.org/InStock",
    `availability: ${eventDetailData.jsonLd?.offers?.availability}`
  );

  // Test Waitlist Event (World Models) - Availability must be omitted (NOT PreOrder)
  await page.goto(`${BASE_URL}/events/beyond-llms-world-models-physical-ai-2026-10-31`, {
    waitUntil: "networkidle2",
  });
  const waitlistLd = await page.evaluate(() => {
    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    return jsonLdScript ? JSON.parse(jsonLdScript.textContent) : null;
  });
  record(
    "Waitlist Event Schema.org Omits Availability (No Fake PreOrder)",
    waitlistLd?.offers?.availability === undefined,
    `availability is ${waitlistLd?.offers?.availability || "cleanly omitted"}`
  );

  // Test Approval-Required Event (DevForge) - Availability must be omitted
  await page.goto(`${BASE_URL}/events/devforge-hackathon-yugaantar-2026`, {
    waitUntil: "networkidle2",
  });
  const approvalLd = await page.evaluate(() => {
    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    return jsonLdScript ? JSON.parse(jsonLdScript.textContent) : null;
  });
  record(
    "Approval-Required Event Schema.org Omits Availability (No Fake PreOrder)",
    approvalLd?.offers?.availability === undefined,
    `availability is ${approvalLd?.offers?.availability || "cleanly omitted"}`
  );

  // 6. Sitemap & Robots
  console.log("\n--- 6. Sitemap & Robots Verification ---");
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();

  record(
    "Sitemap Response 200 OK",
    sitemapRes.status === 200,
    `Status: ${sitemapRes.status}`
  );
  record(
    "Sitemap Uses Expected Domain",
    sitemapXml.includes(EXPECTED_DOMAIN),
    `Found: ${EXPECTED_DOMAIN}`
  );
  record(
    "Sitemap Zero 'orbitblr.in' References",
    !sitemapXml.includes("orbitblr.in"),
    "Clean domain in sitemap"
  );
  record(
    "Sitemap Excludes /saved and /suggest",
    !sitemapXml.includes("/saved") && !sitemapXml.includes("/suggest"),
    "Utility routes excluded"
  );
  record(
    "Sitemap Contains All 9 Published Event Slugs",
    sitemapXml.includes("gears-2026") && sitemapXml.includes("hackman-x") && sitemapXml.includes("devforge"),
    "Published events present"
  );

  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  record(
    "Robots.txt Response 200 OK",
    robotsRes.status === 200,
    `Status: ${robotsRes.status}`
  );
  record(
    "Robots.txt Sitemap URL",
    robotsTxt.includes(`${EXPECTED_DOMAIN}/sitemap.xml`),
    `Sitemap: ${EXPECTED_DOMAIN}/sitemap.xml`
  );
  record(
    "Robots.txt Disallow Admin and Saved",
    robotsTxt.includes("Disallow: /admin/") && robotsTxt.includes("Disallow: /saved"),
    "Admin and saved disallowed"
  );

  // 7. OG Image HTTP Resolution
  console.log("\n--- 7. Social Preview Image HTTP Resolution ---");
  const ogImgRes = await fetch(`${BASE_URL}/og-image.png`);
  record(
    "Brand OG Image Resolves 200 OK",
    ogImgRes.status === 200 && ogImgRes.headers.get("content-type")?.includes("image/png"),
    `Status: ${ogImgRes.status}, Content-Type: ${ogImgRes.headers.get("content-type")}`
  );

  const categoryPngRes = await fetch(`${BASE_URL}/thumbnails/ai-ml.png`);
  record(
    "Category Fallback PNG Resolves 200 OK",
    categoryPngRes.status === 200 && categoryPngRes.headers.get("content-type")?.includes("image/png"),
    `Status: ${categoryPngRes.status}, Content-Type: ${categoryPngRes.headers.get("content-type")}`
  );

  await browser.close();

  // Summary
  console.log("\n=================================================");
  const total = tests.length;
  const passed = tests.filter((t) => t.pass).length;
  const failed = tests.filter((t) => !t.pass).length;
  console.log(`AUDIT COMPLETE: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

verifySeo().catch((err) => {
  console.error("Audit script failed:", err);
  process.exit(1);
});
