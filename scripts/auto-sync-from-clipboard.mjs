import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function getClipboardText() {
  try {
    const out = execSync("powershell -Command \"Get-Clipboard\"", { encoding: "utf-8" });
    return out.trim();
  } catch {
    return "";
  }
}

const text = getClipboardText();

if (!text.startsWith("postgresql://") && !text.startsWith("postgres://")) {
  console.log("WAITING: Clipboard currently contains:", text.substring(0, 30) || "(empty)");
  console.log("Please click the green 'Connect' button in Neon and click 'Copy' on the connection string.");
  process.exit(1);
}

console.log("✅ Valid PostgreSQL connection string detected in clipboard!");

// Update .env.local safely
const envFile = path.join(process.cwd(), ".env.local");
let content = fs.readFileSync(envFile, "utf-8");
if (content.match(/DATABASE_URL=.*/)) {
  content = content.replace(/DATABASE_URL=.*/, `DATABASE_URL="${text}"`);
} else {
  content = `DATABASE_URL="${text}"\n` + content;
}
fs.writeFileSync(envFile, content, "utf-8");
console.log("✅ .env.local updated successfully with new Neon credentials.");

// Verify and sync DB
console.log("🔍 Verifying Neon database connection and applying schema & review queue...");
execSync("node scripts/verify-and-sync-db.mjs", { stdio: "inherit" });

// Sync Vercel
console.log("🔒 Syncing updated DATABASE_URL secret to Vercel...");
execSync("node scripts/sync-vercel-env.mjs", { stdio: "inherit" });

// Redeploy Vercel
console.log("🚀 Triggering Vercel production deployment...");
execSync("npx.cmd vercel --prod --yes", { stdio: "inherit" });

console.log("🎉 Complete! ORBIT BLR is now live on Vercel with your claimed Neon PostgreSQL database!");
