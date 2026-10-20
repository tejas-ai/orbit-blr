import https from "node:https";
import http from "node:http";

const urls = [
  "https://luma.com/1dfd73wq",
  "https://luma.com/wlstrxqv",
  "https://www.meetup.com/softwarearchitectsbangalore/events/316719692/",
  "https://www.meetup.com/bangpypers/events/312819339/",
  "https://in.bookmyshow.com/events/gears-2026-higher-education-ai-summit/ET00520132",
  "https://luma.com/lwzwhpz5"
];

async function fetchMeta(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000)
    });
    
    if (!res.ok) return { url, status: res.status, error: "HTTP error" };
    const html = await res.text();
    
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    const twImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
                         html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i);
    
    return {
      url,
      status: res.status,
      ogImage: ogImageMatch ? ogImageMatch[1] : null,
      twImage: twImageMatch ? twImageMatch[1] : null
    };
  } catch (err) {
    return { url, error: err.message };
  }
}

console.log("Testing OG image scraping on verified registration URLs...");
for (const u of urls) {
  const result = await fetchMeta(u);
  console.log(`\nURL: ${u}`);
  console.log(`OG Image: ${result.ogImage || "None"}`);
  console.log(`Twitter Image: ${result.twImage || "None"}`);
}
