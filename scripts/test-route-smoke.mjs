import { spawn } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";

const port = 39741;
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "start", "--", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, PORT: String(port), DATABASE_URL: "", AUTH_GITHUB_ID: "", AUTH_GITHUB_SECRET: "" }
});
let output = "";
child.stdout.on("data", c => { output += c.toString(); });
child.stderr.on("data", c => { output += c.toString(); });
const tests = [
  ["/", 200],
  ["/explore", 200],
  ["/saved", 200],
  ["/suggest", 200],
  ["/api/events", 200],
  ["/admin", 404],
  ["/api/admin", 404],
  ["/api/admin/events", 404],
  ["/api/user/saved-events", 401],
  ["/api/cron/events-maintenance", 401],
  ["/api/stats/users", 401]
];
try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (child.exitCode !== null) throw new Error("Next process stopped early: " + output.slice(-1400));
    try { const r = await fetch(origin + "/robots.txt", { signal: AbortSignal.timeout(1200) }); if (r.ok) { ready = true; break; } } catch {}
    await pause(500);
  }
  if (!ready) throw new Error("Next server did not become healthy: " + output.slice(-1400));
  for (const [path, expected] of tests) {
    const response = await fetch(origin + path, { redirect: "manual", signal: AbortSignal.timeout(12000) });
    if (response.status !== expected) throw new Error(`${path}: expected ${expected}, got ${response.status}`);
    if (path === "/api/events") {
      const data = await response.json();
      if (data.success !== true || !Array.isArray(data.events)) throw new Error("Event API response invalid");
      if (data.events.some(e => e.publication_status !== "published")) throw new Error("Unpublished event leaked into public API");
    }
    console.log(`PASS ${expected} ${path}`);
  }
} catch (e) {
  console.error("SMOKE TEST FAILED:", e.message);
  process.exitCode = 1;
} finally {
  child.kill("SIGTERM");
}
