import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found");
  process.exit(1);
}

const lines = fs.readFileSync(envPath, "utf-8").split("\n");
const envVars = {};

for (const line of lines) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/^["']|["']$/g, "");
    envVars[key] = val;
  }
}

const requiredKeys = ["DATABASE_URL", "ORBIT_ADMIN_PASSWORD", "ORBIT_API_SECRET"];

for (const key of requiredKeys) {
  if (!envVars[key]) {
    console.error(`❌ Missing ${key} in .env.local`);
    process.exit(1);
  }
}

console.log("🔒 Securely pushing environment variables to Vercel production & preview...");

for (const key of requiredKeys) {
  try {
    // Add to production,preview,development as sensitive secret
    const cmd = `npx.cmd vercel env add ${key} production,preview,development --sensitive --force --yes`;
    execSync(cmd, { input: envVars[key], stdio: ["pipe", "pipe", "pipe"] });
    console.log(`✅ Variable '${key}' successfully configured on Vercel.`);
  } catch (err) {
    console.error(`❌ Failed to add ${key} to Vercel:`, err.message);
  }
}

console.log("🎉 All required server-side secrets are now securely provisioned on Vercel.");
