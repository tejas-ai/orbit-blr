import fs from "node:fs";
import path from "node:path";

const targetDir = path.join(process.cwd(), "public", "thumbnails");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function createDistrictSvg({ title, subtitle, icon, accentColor = "#8B5CF6", glowColor = "#7C3AED" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140F26"/>
      <stop offset="50%" stop-color="#0E0A1D"/>
      <stop offset="100%" stop-color="#090613"/>
    </linearGradient>

    <!-- Subtle Ambient Radial Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.28"/>
      <stop offset="60%" stop-color="${accentColor}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle Geometric Grid -->
    <pattern id="subtleGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" stroke-opacity="0.03" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Canvas -->
  <rect width="1200" height="675" fill="url(#bgGrad)"/>
  <rect width="1200" height="675" fill="url(#subtleGrid)"/>
  <circle cx="600" cy="240" r="480" fill="url(#centerGlow)"/>

  <!-- Outer Rounded Border -->
  <rect x="32" y="32" width="1136" height="611" rx="28" fill="none" stroke="#8B5CF6" stroke-opacity="0.18" stroke-width="1.5"/>

  <!-- Top Badges -->
  <g transform="translate(64, 64)">
    <rect width="168" height="34" rx="17" fill="#1E1638" stroke="#8B5CF6" stroke-opacity="0.4" stroke-width="1"/>
    <circle cx="20" cy="17" r="4.5" fill="${accentColor}"/>
    <text x="36" y="22" fill="#E2E8F0" font-family="'DM Sans', -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="2">ORBIT BLR</text>
  </g>

  <g transform="translate(976, 64)">
    <rect width="160" height="34" rx="17" fill="#064E3B" fill-opacity="0.4" stroke="#10B981" stroke-opacity="0.4" stroke-width="1"/>
    <text x="80" y="22" fill="#34D399" font-family="monospace" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle">₹0 FREE ADMISSION</text>
  </g>

  <!-- Centered Icon Graphic -->
  <g transform="translate(600, 220)">
    ${icon}
  </g>

  <!-- Typography Area -->
  <g transform="translate(600, 420)">
    <text x="0" y="0" fill="${accentColor}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="4" text-anchor="middle">VERIFIED IN-PERSON SERIES</text>
    <text x="0" y="52" fill="#FFFFFF" font-family="'Syne', -apple-system, sans-serif" font-size="44" font-weight="800" letter-spacing="-0.5" text-anchor="middle">${escapeXml(title)}</text>
    <text x="0" y="94" fill="#94A3B8" font-family="'DM Sans', -apple-system, sans-serif" font-size="18" font-weight="400" letter-spacing="0.5" text-anchor="middle">${escapeXml(subtitle)}</text>
  </g>

  <!-- Bottom Verification Guarantee -->
  <g transform="translate(600, 585)">
    <circle cx="-160" cy="-4" r="4.5" fill="#10B981"/>
    <text x="0" y="0" fill="#64748B" font-family="monospace" font-size="11" letter-spacing="1.5" text-anchor="middle">INDEPENDENT VERIFICATION • OFFICIAL ORGANISER REGISTRATION</text>
  </g>
</svg>`;
}

const SVGS = {
  "hackathons.svg": createDistrictSvg({
    title: "Hackathons & Build Sprints",
    subtitle: "24-Hour Offline Hackathons, Demos & Hardware Builds in Bengaluru",
    accentColor: "#F59E0B",
    glowColor: "#D97706",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#78350F" fill-opacity="0.35" stroke="#F59E0B" stroke-width="2"/>
      <path d="M 6 -24 L -14 0 L 2 0 L -6 24 L 16 -2 L -2 -2 Z" fill="#FBBF24"/>
    `,
  }),

  "ai-ml.svg": createDistrictSvg({
    title: "AI & Machine Learning",
    subtitle: "Large Language Models, Physical AI, Neural Systems & Deep Learning",
    accentColor: "#8B5CF6",
    glowColor: "#7C3AED",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#2E1065" fill-opacity="0.45" stroke="#8B5CF6" stroke-width="2"/>
      <circle cx="0" cy="0" r="14" fill="#A78BFA"/>
      <circle cx="-24" cy="-14" r="6" fill="#DDD6FE"/>
      <circle cx="24" cy="-14" r="6" fill="#DDD6FE"/>
      <circle cx="-20" cy="20" r="6" fill="#DDD6FE"/>
      <circle cx="20" cy="20" r="6" fill="#DDD6FE"/>
      <line x1="0" y1="0" x2="-24" y2="-14" stroke="#8B5CF6" stroke-width="2"/>
      <line x1="0" y1="0" x2="24" y2="-14" stroke="#8B5CF6" stroke-width="2"/>
      <line x1="0" y1="0" x2="-20" y2="20" stroke="#8B5CF6" stroke-width="2"/>
      <line x1="0" y1="0" x2="20" y2="20" stroke="#8B5CF6" stroke-width="2"/>
    `,
  }),

  "developer.svg": createDistrictSvg({
    title: "Developer & Engineering Meetups",
    subtitle: "Systems Architecture, Kotlin, Android, Python & Polyglot Tech",
    accentColor: "#38BDF8",
    glowColor: "#0284C7",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#0C4A6E" fill-opacity="0.4" stroke="#38BDF8" stroke-width="2"/>
      <path d="M -16 -12 L -26 0 L -16 12" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 16 -12 L 26 0 L 16 12" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="4" y1="-14" x2="-4" y2="14" stroke="#E0F2FE" stroke-width="3" stroke-linecap="round"/>
    `,
  }),

  "cybersecurity.svg": createDistrictSvg({
    title: "Cybersecurity & AppSec",
    subtitle: "Threat Defense, Zero Trust, Penetration Testing & OWASP Communities",
    accentColor: "#EC4899",
    glowColor: "#BE185D",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#500724" fill-opacity="0.4" stroke="#EC4899" stroke-width="2"/>
      <path d="M 0 -22 L 20 -12 C 20 10 0 24 0 24 C 0 24 -20 10 -20 -12 Z" fill="none" stroke="#F472B6" stroke-width="2.5"/>
      <circle cx="0" cy="2" r="5" fill="#F472B6"/>
      <line x1="0" y1="7" x2="0" y2="12" stroke="#F472B6" stroke-width="2"/>
    `,
  }),

  "cloud.svg": createDistrictSvg({
    title: "Cloud & Distributed Systems",
    subtitle: "Kubernetes, Serverless, DevOps & Multi-Cloud Infrastructure",
    accentColor: "#6366F1",
    glowColor: "#4F46E5",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#1E1B4B" fill-opacity="0.45" stroke="#6366F1" stroke-width="2"/>
      <path d="M -18 8 C -26 8 -30 -2 -24 -8 C -22 -18 -8 -22 2 -18 C 10 -24 24 -18 24 -8 C 30 -6 30 6 22 8 Z" fill="none" stroke="#818CF8" stroke-width="2.5"/>
    `,
  }),

  "data-science.svg": createDistrictSvg({
    title: "Data Science & Analytics",
    subtitle: "High-Throughput Pipelines, Vector Databases & ML Engineering",
    accentColor: "#14B8A6",
    glowColor: "#0D9488",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#134E4A" fill-opacity="0.4" stroke="#14B8A6" stroke-width="2"/>
      <rect x="-18" y="2" width="8" height="16" rx="2" fill="#2DD4BF"/>
      <rect x="-4" y="-8" width="8" height="26" rx="2" fill="#2DD4BF"/>
      <rect x="10" y="-18" width="8" height="36" rx="2" fill="#2DD4BF"/>
    `,
  }),

  "workshops.svg": createDistrictSvg({
    title: "Hands-on Tech Workshops",
    subtitle: "Architecture Whiteboarding, Practical Code Labs & Live Demos",
    accentColor: "#A855F7",
    glowColor: "#9333EA",
    icon: `
      <circle cx="0" cy="0" r="56" fill="#3B0764" fill-opacity="0.4" stroke="#A855F7" stroke-width="2"/>
      <rect x="-20" y="-14" width="40" height="28" rx="4" fill="none" stroke="#C084FC" stroke-width="2.5"/>
      <line x1="-10" y1="14" x2="10" y2="14" stroke="#C084FC" stroke-width="2.5"/>
      <line x1="0" y1="14" x2="0" y2="20" stroke="#C084FC" stroke-width="2.5"/>
    `,
  }),
};

for (const [filename, content] of Object.entries(SVGS)) {
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Generated: ${filePath}`);
}

console.log("All static SVG thumbnails created successfully!");
