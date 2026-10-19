import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf-8");
for (const line of env.split("\n")) {
  if (line.startsWith("DATABASE_URL=")) {
    const val = line.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
    try {
      const u = new URL(val);
      console.log("Protocol:", u.protocol);
      console.log("Username:", u.username);
      console.log("Host:", u.host);
      console.log("Database:", u.pathname);
      console.log("Has Password:", Boolean(u.password));
    } catch (e) {
      console.error("Invalid URL format:", e.message);
    }
  }
}
