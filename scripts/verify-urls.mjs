import { readFileSync } from "node:fs";
import { join } from "node:path";

const seedTsContent = readFileSync(join(process.cwd(), "src/lib/seed-data.ts"), "utf-8");
const jsonMatch = seedTsContent.match(/export const SEED_EVENTS: OrbitEvent\[\] = (\[[\s\S]*\]);/);
const events = eval(jsonMatch[1]);

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });
    return { status: res.status, finalUrl: res.url, ok: res.ok };
  } catch (err) {
    return { status: "ERROR", error: err.message, ok: false };
  }
}

async function run() {
  console.log("Checking all event URLs:\n");
  for (const e of events) {
    console.log(`Checking [${e.id}] ${e.name}`);
    console.log(`  URL: ${e.registration_url}`);
    const res = await checkUrl(e.registration_url);
    console.log(`  Result: status=${res.status}, ok=${res.ok}, finalUrl=${res.finalUrl || ""}`);
    if (res.error) console.log(`  Error: ${res.error}`);
    console.log("--------------------------------------------------");
  }
}

run();
