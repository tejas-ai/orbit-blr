import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const THUMB_DIR = path.resolve(process.cwd(), "public/thumbnails");

async function renderCategoryPngs() {
  console.log("Rendering category fallback SVGs to high-resolution PNGs for Open Graph compatibility...");
  const files = fs.readdirSync(THUMB_DIR).filter((f) => f.endsWith(".svg"));

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const file of files) {
    const baseName = path.basename(file, ".svg");
    const svgPath = path.join(THUMB_DIR, file);
    const svgContent = fs.readFileSync(svgPath, "utf-8");

    const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { width: 1200px; height: 630px; overflow: hidden; background: #0E0A1D; display: flex; align-items: center; justify-content: center; }
    svg { width: 1200px; height: 630px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    // Small 100ms pause for font/layout settlement
    await new Promise((r) => setTimeout(r, 100));
    const targetPng = path.join(THUMB_DIR, `${baseName}.png`);
    await page.screenshot({ path: targetPng, type: "png" });
    console.log(`Generated: ${baseName}.png (${(fs.statSync(targetPng).size / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log("All category PNG fallbacks generated successfully.");
}

renderCategoryPngs().catch((err) => {
  console.error("Error generating category PNGs:", err);
  process.exit(1);
});
