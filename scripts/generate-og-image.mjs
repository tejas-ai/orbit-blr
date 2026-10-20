import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const ARTIFACT_DIR = "C:\\Users\\tejas\\.gemini\\antigravity\\brain\\7fcc6e40-55c0-4fda-aa39-f5cd69729988";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      background-color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 56px 64px;
      position: relative;
      overflow: hidden;
    }

    /* Ambient background gradient accents */
    .bg-accent-1 {
      position: absolute;
      top: -120px;
      right: -80px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(106, 56, 235, 0.12) 0%, rgba(147, 51, 234, 0.04) 50%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }
    .bg-accent-2 {
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(147, 51, 234, 0.08) 0%, rgba(106, 56, 235, 0.02) 60%, transparent 80%);
      border-radius: 50%;
      pointer-events: none;
    }

    /* Top Brand & Verification Bar */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6A38EB 0%, #9333EA 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 28px;
      font-weight: 900;
      box-shadow: 0 8px 20px rgba(106, 56, 235, 0.25);
    }
    .brand-text {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .brand-title {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #0F172A;
    }
    .brand-tag {
      font-size: 18px;
      font-weight: 800;
      color: #6A38EB;
      letter-spacing: 0.15em;
    }

    .badge-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      border-radius: 9999px;
      background: #FAF9FF;
      border: 1.5px solid #E9D5FF;
      color: #6A38EB;
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .green-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #10B981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
    }

    /* Hero Text Content */
    .main-content {
      position: relative;
      z-index: 10;
      margin-top: -10px;
    }
    .hero-title {
      font-size: 54px;
      line-height: 1.15;
      font-weight: 900;
      letter-spacing: -0.035em;
      color: #0F172A;
      max-width: 980px;
      margin-bottom: 20px;
    }
    .hero-title span.highlight {
      background: linear-gradient(135deg, #6A38EB 0%, #9333EA 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 22px;
      line-height: 1.45;
      color: #475569;
      max-width: 940px;
      font-weight: 500;
    }

    /* Footer: 4 Feature Chips */
    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      border-top: 1.5px solid #F1F5F9;
      padding-top: 24px;
    }
    .features-list {
      display: flex;
      gap: 12px;
    }
    .feature-chip {
      padding: 8px 16px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      color: #334155;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .feature-chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #6A38EB;
    }
    .domain-badge {
      font-size: 15px;
      font-weight: 700;
      color: #6A38EB;
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="bg-accent-1"></div>
  <div class="bg-accent-2"></div>

  <!-- Header -->
  <div class="header">
    <div class="brand-group">
      <div class="brand-icon">O</div>
      <div class="brand-text">
        <span class="brand-title">ORBIT</span>
        <span class="brand-tag">BLR</span>
      </div>
    </div>
    <div class="badge-pill">
      <div class="green-dot"></div>
      <span>INDEPENDENTLY VERIFIED &bull; ₹0 ENTRY</span>
    </div>
  </div>

  <!-- Main Content -->
  <div class="main-content">
    <h1 class="hero-title">
      Discover Free Tech Events &amp; <span class="highlight">Hackathons in Bengaluru</span>
    </h1>
    <p class="hero-subtitle">
      Bengaluru&rsquo;s verified calendar for tech meetups, AI workshops, developer conferences and hackathons. Direct organiser registration links with zero admission fees.
    </p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="features-list">
      <div class="feature-chip"><span class="dot"></span> AI &amp; LLM Summits</div>
      <div class="feature-chip"><span class="dot"></span> Developer Meetups</div>
      <div class="feature-chip"><span class="dot"></span> College Hackathons</div>
      <div class="feature-chip"><span class="dot"></span> Open Source &amp; Systems</div>
    </div>
    <div class="domain-badge">orbit-blr.vercel.app</div>
  </div>
</body>
</html>`;

async function generateOgImage() {
  console.log("Generating 1200x630 brand social preview image (public/og-image.png)...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const targetPath = path.join(PUBLIC_DIR, "og-image.png");
  await page.screenshot({ path: targetPath, type: "png" });
  console.log(`Saved og-image.png to: ${targetPath}`);

  // Copy to brain artifact directory for inspection
  const artifactPath = path.join(ARTIFACT_DIR, "og-image.png");
  fs.copyFileSync(targetPath, artifactPath);
  console.log(`Copied og-image.png to artifact dir: ${artifactPath}`);

  await browser.close();
}

generateOgImage().catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
