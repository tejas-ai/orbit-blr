import { OrbitEvent, EventCategory } from "@/types/event";

/**
 * Clean, original, high-fidelity SVG artwork for ORBIT BLR categories.
 * Crafted with the "Vice City meets Bengaluru" aesthetic:
 * Deep Obsidian (#09090B), Midnight Violet, Hot Pink, Electric Cyan, and Sunset Coral.
 */
function generateCategorySvg(
  category: string,
  accentColor: string,
  secondaryColor: string,
  iconSvg: string,
  subtitle: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090B"/>
      <stop offset="50%" stop-color="#18042B"/>
      <stop offset="100%" stop-color="#09090B"/>
    </linearGradient>
    <radialGradient id="glow" cx="60%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.35"/>
      <stop offset="40%" stop-color="${secondaryColor}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.03"/>
      <stop offset="70%" stop-color="${accentColor}" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="neonTitle" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#F8F7FC"/>
      <stop offset="100%" stop-color="${accentColor}"/>
    </linearGradient>
    <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <line x1="0" y1="40" x2="40" y2="40" stroke="#00E5FF" stroke-opacity="0.06" stroke-width="1"/>
      <line x1="40" y1="0" x2="40" y2="40" stroke="#00E5FF" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Base Canvas -->
  <rect width="1200" height="675" fill="url(#bg)"/>
  
  <!-- Ambient Atmospheric Glow -->
  <circle cx="750" cy="300" r="450" fill="url(#glow)"/>

  <!-- Futuristic Perspective Grid -->
  <rect y="380" width="1200" height="295" fill="url(#cityGrid)"/>
  <rect y="380" width="1200" height="295" fill="url(#gridGrad)"/>

  <!-- Bengaluru Tech Silhouette Backdrop Accent -->
  <path d="M 0 540 L 80 540 L 80 500 L 140 500 L 140 540 L 220 540 L 220 480 L 250 450 L 280 480 L 280 540 L 360 540 L 360 510 L 420 510 L 420 540 L 520 540 L 520 460 L 560 460 L 560 540 L 680 540 L 680 490 L 730 490 L 730 540 L 850 540 L 850 440 L 890 410 L 930 440 L 930 540 L 1050 540 L 1050 495 L 1110 495 L 1110 540 L 1200 540 L 1200 675 L 0 675 Z" fill="#09090B" fill-opacity="0.85"/>
  <path d="M 0 540 L 80 540 L 80 500 L 140 500 L 140 540 L 220 540 L 220 480 L 250 450 L 280 480 L 280 540 L 360 540 L 360 510 L 420 510 L 420 540 L 520 540 L 520 460 L 560 460 L 560 540 L 680 540 L 680 490 L 730 490 L 730 540 L 850 540 L 850 440 L 890 410 L 930 440 L 930 540 L 1050 540 L 1050 495 L 1110 495 L 1110 540 L 1200 540" fill="none" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="2"/>

  <!-- Neon Frame Glow Border -->
  <rect x="24" y="24" width="1152" height="627" rx="20" fill="none" stroke="${accentColor}" stroke-opacity="0.2" stroke-width="1.5"/>
  <rect x="28" y="28" width="1144" height="619" rx="18" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1"/>

  <!-- Top Badges -->
  <g transform="translate(60, 70)">
    <rect width="180" height="32" rx="16" fill="#09090B" fill-opacity="0.9" stroke="${accentColor}" stroke-opacity="0.5" stroke-width="1"/>
    <circle cx="18" cy="16" r="4" fill="${accentColor}"/>
    <text x="32" y="21" fill="${accentColor}" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="2">ORBIT BLR</text>
  </g>

  <g transform="translate(980, 70)">
    <rect width="160" height="32" rx="16" fill="#00E5FF" fill-opacity="0.12" stroke="#00E5FF" stroke-opacity="0.4" stroke-width="1"/>
    <text x="80" y="21" fill="#00E5FF" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="1.5" text-anchor="middle">₹0 FREE ADMISSION</text>
  </g>

  <!-- Central Graphic Motif -->
  <g transform="translate(680, 160)">
    ${iconSvg}
  </g>

  <!-- Category & Typography -->
  <g transform="translate(70, 360)">
    <text x="0" y="0" fill="${accentColor}" font-family="monospace" font-size="16" font-weight="700" letter-spacing="4">IN-PERSON BENGALURU SERIES</text>
    <text x="0" y="64" fill="url(#neonTitle)" font-family="'Syne', 'Inter', sans-serif" font-size="58" font-weight="900" letter-spacing="-1">${category.toUpperCase()}</text>
    <text x="0" y="105" fill="#A5B4FC" font-family="'DM Sans', 'Inter', sans-serif" font-size="20" font-weight="400" letter-spacing="0.5">${subtitle}</text>
  </g>

  <!-- Bottom Verification Guarantee -->
  <g transform="translate(70, 580)">
    <circle cx="10" cy="10" r="5" fill="#10B981"/>
    <text x="26" y="15" fill="#94A3B8" font-family="monospace" font-size="12" letter-spacing="1">VERIFIED IN-PERSON EVENT • DIRECT ORGANISER REGISTRATION</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Category fallback SVGs
const CATEGORY_FALLBACKS: Record<string, string> = {
  "AI & ML": generateCategorySvg(
    "AI & Machine Learning",
    "#FF2D8D",
    "#00E5FF",
    `<!-- AI Neural Net -->
    <circle cx="160" cy="140" r="100" fill="none" stroke="#FF2D8D" stroke-opacity="0.4" stroke-width="2"/>
    <circle cx="160" cy="140" r="60" fill="none" stroke="#00E5FF" stroke-opacity="0.6" stroke-width="1.5"/>
    <circle cx="160" cy="140" r="18" fill="#FF2D8D" fill-opacity="0.8"/>
    <line x1="80" y1="140" x2="240" y2="140" stroke="#00E5FF" stroke-width="2" stroke-dasharray="4,4"/>
    <line x1="160" y1="60" x2="160" y2="220" stroke="#FF2D8D" stroke-width="2" stroke-dasharray="4,4"/>
    <circle cx="90" cy="90" r="8" fill="#00E5FF"/>
    <circle cx="230" cy="90" r="8" fill="#FF2D8D"/>
    <circle cx="90" cy="190" r="8" fill="#FF6A3D"/>
    <circle cx="230" cy="190" r="8" fill="#00E5FF"/>
    <line x1="90" y1="90" x2="160" y2="140" stroke="#FFFFFF" stroke-opacity="0.4"/>
    <line x1="230" y1="90" x2="160" y2="140" stroke="#FFFFFF" stroke-opacity="0.4"/>
    <line x1="90" y1="190" x2="160" y2="140" stroke="#FFFFFF" stroke-opacity="0.4"/>
    <line x1="230" y1="190" x2="160" y2="140" stroke="#FFFFFF" stroke-opacity="0.4"/>`,
    "GenAI, LLMs, Neural Architectures & Deep Learning"
  ),

  Developer: generateCategorySvg(
    "Developer Meetup",
    "#00E5FF",
    "#FF2D8D",
    `<!-- Dev Code Syntax -->
    <rect x="50" y="40" width="220" height="180" rx="16" fill="#09090B" fill-opacity="0.8" stroke="#00E5FF" stroke-opacity="0.5" stroke-width="2"/>
    <circle cx="80" cy="65" r="5" fill="#FF2D8D"/>
    <circle cx="98" cy="65" r="5" fill="#FFB347"/>
    <circle cx="116" cy="65" r="5" fill="#00E5FF"/>
    <path d="M 100 115 L 80 135 L 100 155" fill="none" stroke="#00E5FF" stroke-width="3" stroke-linecap="round"/>
    <path d="M 220 115 L 240 135 L 220 155" fill="none" stroke="#FF2D8D" stroke-width="3" stroke-linecap="round"/>
    <line x1="170" y1="110" x2="150" y2="160" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="3" stroke-linecap="round"/>`,
    "Open Source, Architecture, Systems & Polyglot Engineering"
  ),

  Cybersecurity: generateCategorySvg(
    "Cybersecurity & Security",
    "#FF2D8D",
    "#FF6A3D",
    `<!-- Shield & Cryptography -->
    <path d="M 160 50 L 240 90 L 240 160 C 240 210 160 250 160 250 C 160 250 80 210 80 160 L 80 90 Z" fill="none" stroke="#FF2D8D" stroke-width="3"/>
    <circle cx="160" cy="140" r="22" fill="none" stroke="#00E5FF" stroke-width="3"/>
    <path d="M 160 162 L 160 185" stroke="#00E5FF" stroke-width="4" stroke-linecap="round"/>`,
    "AppSec, Zero Trust, Penetration Testing & Threat Defense"
  ),

  Cloud: generateCategorySvg(
    "Cloud Computing",
    "#FF6A3D",
    "#00E5FF",
    `<!-- Cloud Nodes -->
    <path d="M 90 170 C 70 170 50 150 50 130 C 50 112 65 95 85 92 C 95 65 125 45 160 45 C 200 45 235 70 242 105 C 260 108 275 124 275 142 C 275 165 255 180 235 180 Z" fill="none" stroke="#FF6A3D" stroke-width="3"/>
    <circle cx="160" cy="115" r="10" fill="#00E5FF"/>
    <circle cx="115" cy="140" r="7" fill="#FF2D8D"/>
    <circle cx="205" cy="140" r="7" fill="#FFB347"/>
    <line x1="160" y1="115" x2="115" y2="140" stroke="#FFFFFF" stroke-opacity="0.4"/>
    <line x1="160" y1="115" x2="205" y2="140" stroke="#FFFFFF" stroke-opacity="0.4"/>`,
    "Serverless, Kubernetes, Multi-Cloud & Distributed Infrastructure"
  ),

  "Data Science": generateCategorySvg(
    "Data Science & Analytics",
    "#FFB347",
    "#FF2D8D",
    `<!-- Data Charts & Analytics -->
    <rect x="70" y="160" width="30" height="70" rx="4" fill="#FF2D8D"/>
    <rect x="115" y="120" width="30" height="110" rx="4" fill="#FFB347"/>
    <rect x="160" y="80" width="30" height="150" rx="4" fill="#00E5FF"/>
    <rect x="205" y="140" width="30" height="90" rx="4" fill="#FF6A3D"/>
    <path d="M 85 150 Q 130 100 175 70 T 220 130" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`,
    "High-Performance Pipelines, ML Engineering & Big Data"
  ),

  Robotics: generateCategorySvg(
    "Robotics & Hardware",
    "#00E5FF",
    "#FFB347",
    `<!-- Robotics Gear & Circuit -->
    <circle cx="160" cy="140" r="45" fill="none" stroke="#00E5FF" stroke-width="4"/>
    <circle cx="160" cy="140" r="15" fill="#FFB347"/>
    <line x1="160" y1="80" x2="160" y2="60" stroke="#00E5FF" stroke-width="6" stroke-linecap="round"/>
    <line x1="160" y1="200" x2="160" y2="220" stroke="#00E5FF" stroke-width="6" stroke-linecap="round"/>
    <line x1="100" y1="140" x2="80" y2="140" stroke="#00E5FF" stroke-width="6" stroke-linecap="round"/>
    <line x1="220" y1="140" x2="240" y2="140" stroke="#00E5FF" stroke-width="6" stroke-linecap="round"/>`,
    "Embedded Systems, Edge AI, IoT & Autonomous Hardware"
  ),

  "Quantum Computing": generateCategorySvg(
    "Quantum Computing",
    "#D61C8C",
    "#00E5FF",
    `<!-- Quantum Superposition -->
    <ellipse cx="160" cy="140" rx="90" ry="35" fill="none" stroke="#D61C8C" stroke-width="2.5" transform="rotate(-30 160 140)"/>
    <ellipse cx="160" cy="140" rx="90" ry="35" fill="none" stroke="#00E5FF" stroke-width="2.5" transform="rotate(30 160 140)"/>
    <circle cx="160" cy="140" r="14" fill="#FF2D8D"/>`,
    "Qubits, Quantum Algorithms & Superposition Simulations"
  ),

  Startup: generateCategorySvg(
    "Startup & Founders",
    "#FFB347",
    "#FF2D8D",
    `<!-- Startup Rocket Launch -->
    <path d="M 160 50 C 185 85 200 135 200 180 L 120 180 C 120 135 135 85 160 50 Z" fill="none" stroke="#FFB347" stroke-width="3"/>
    <circle cx="160" cy="115" r="12" fill="#00E5FF"/>
    <path d="M 120 165 L 90 195 L 120 190 Z" fill="#FF2D8D"/>
    <path d="M 200 165 L 230 195 L 200 190 Z" fill="#FF2D8D"/>
    <polygon points="145,185 160,225 175,185" fill="#FF6A3D"/>`,
    "Pitch Sessions, Demo Days, Co-Founders & Venture Building"
  ),

  Networking: generateCategorySvg(
    "Tech Networking",
    "#FF2D8D",
    "#00E5FF",
    `<!-- Network Constellation -->
    <circle cx="160" cy="100" r="14" fill="#FF2D8D"/>
    <circle cx="100" cy="180" r="12" fill="#00E5FF"/>
    <circle cx="220" cy="180" r="12" fill="#FFB347"/>
    <circle cx="160" cy="220" r="8" fill="#10B981"/>
    <line x1="160" y1="100" x2="100" y2="180" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="160" y1="100" x2="220" y2="180" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="100" y1="180" x2="220" y2="180" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="100" y1="180" x2="160" y2="220" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>
    <line x1="220" y1="180" x2="160" y2="220" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5"/>`,
    "Socials, Mixer Nights, Hallway Tracks & Peer Connections"
  ),

  Workshops: generateCategorySvg(
    "Hands-on Workshops",
    "#00E5FF",
    "#FF6A3D",
    `<!-- Workbench & Tools -->
    <rect x="70" y="80" width="180" height="120" rx="12" fill="#09090B" stroke="#00E5FF" stroke-width="2"/>
    <path d="M 100 140 L 130 110 L 150 130 L 200 80" fill="none" stroke="#FF6A3D" stroke-width="3" stroke-linecap="round"/>
    <circle cx="200" cy="80" r="5" fill="#FF2D8D"/>`,
    "Code Labs, Architecture Whiteboarding & Practical Builds"
  ),
};

export interface ResolvedThumbnail {
  src: string;
  alt: string;
  isVerified: boolean;
  attribution: string;
}

/**
 * Returns the authentic verified thumbnail or category fallback artwork.
 */
export function getEventThumbnail(event: Partial<OrbitEvent>): ResolvedThumbnail {
  const categoryKey = event.category || "Developer";

  // 1. If authentic verified external thumbnail exists, return it
  if (
    event.thumbnail_url &&
    event.thumbnail_url.trim() !== "" &&
    event.thumbnail_verification_status === "verified"
  ) {
    return {
      src: event.thumbnail_url,
      alt: event.thumbnail_alt || `${event.name || "Tech Event"} — Official Banner`,
      isVerified: true,
      attribution: event.thumbnail_attribution || `Official ${event.organizer || "Organiser"} Asset`,
    };
  }

  // 2. High-aesthetic category fallback graphic
  const fallback =
    CATEGORY_FALLBACKS[categoryKey] ||
    CATEGORY_FALLBACKS[categoryKey.toLowerCase()] ||
    CATEGORY_FALLBACKS["Developer"];

  return {
    src: fallback,
    alt: `${event.name || categoryKey} — ORBIT BLR Verified Series`,
    isVerified: false,
    attribution: "ORBIT BLR Verified Category Visual",
  };
}

/**
 * Discovers and inspects Open Graph / Twitter image from registration URL.
 */
export async function discoverThumbnailFromUrl(
  registrationUrl: string
): Promise<{ url: string | null; alt: string | null; attribution: string | null }> {
  try {
    const res = await fetch(registrationUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return { url: null, alt: null, attribution: null };
    const html = await res.text();

    const ogImageMatch =
      html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    const twImageMatch =
      html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i);

    const found = twImageMatch ? twImageMatch[1] : ogImageMatch ? ogImageMatch[1] : null;

    if (found && found.startsWith("http")) {
      return {
        url: found,
        alt: "Official Organiser Event Image",
        attribution: "Official Registration Page Metadata",
      };
    }
  } catch {
    // Non-fatal fallback
  }

  return { url: null, alt: null, attribution: null };
}
