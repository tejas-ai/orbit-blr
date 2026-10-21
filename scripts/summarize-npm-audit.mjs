import fs from "node:fs";

const p = process.argv[2] || "dependency-audit.json";
if (!fs.existsSync(p)) {
  console.error("Audit report missing");
  process.exitCode = 1;
} else {
  let data;
  try { data = JSON.parse(fs.readFileSync(p, "utf8")); }
  catch { console.error("Audit output was not JSON"); process.exitCode = 1; }
  if (data) {
    const v = data.metadata?.vulnerabilities || {};
    console.log("Production dependency audit:", JSON.stringify(v));
    if ((v.critical || 0) > 0 || (v.high || 0) > 0) {
      console.error("ACTION REQUIRED: high/critical production dependency advisories remain.");
      process.exitCode = 1;
    }
    if (data.error) { console.error("npm audit could not complete:", data.error.message || "unknown"); process.exitCode = 1; }
  }
}
