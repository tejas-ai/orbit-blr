import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        orbit: {
          // Midnight Violet & District Theme Tokens
          darkBg: "#0E0E16",
          darkSurface: "#151522",
          darkCard: "#1D1B2C",
          darkCardHover: "#26233A",
          darkText: "#F7F5FF",
          darkMuted: "#C4C0D6",
          darkPurple: "#A78BFA",
          darkAccent: "#8B5CF6",
          darkBorder: "#302B43",
          darkBorderHover: "#4A4366",

          // District-Inspired Royal Purple & Soft Lavender Palette
          bg: "#0B0813", // Deep Obsidian Indigo
          surface: "#140F24", // Refined Midnight Violet
          surfaceHover: "#1C1533",
          card: "#130D26", // Deep Slate Purple card surface
          cardHover: "#1B1336",
          border: "#2D1F4E", // Soft Lavender-Purple border
          borderLight: "#432E73",
          
          // Refined Accents
          signal: "#8B5CF6", // Electric Violet / Purple
          signalHover: "#A78BFA",
          signalGlow: "rgba(139, 92, 246, 0.25)",
          
          pink: "#A855F7", // Purple Accent
          pinkHover: "#C084FC",
          magenta: "#9333EA", // Royal Violet
          sunset: "#F59E0B", // Warm Amber
          gold: "#FBBF24", // Amber Gold
          
          secondary: "#C4B5FD", // Soft Lavender
          highlight: "#DDD6FE", // Lavender Glow
          text: "#FFFFFF", // Crisp White
          muted: "#CBD5E1", // Clean Slate Gray / Lavender for high readability
          subtle: "#94A3B8", // Refined Muted Slate
          
          danger: "#EF4444",
          warning: "#F59E0B",
          success: "#10B981", // Emerald
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "Syne", "sans-serif"],
        body: ["var(--font-dmsans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.3)",
        glowPink: "0 0 30px -5px rgba(168, 85, 247, 0.3)",
        glowCyan: "0 0 30px -5px rgba(139, 92, 246, 0.3)",
        glowSunset: "0 0 30px -5px rgba(245, 158, 11, 0.3)",
        card: "0 8px 30px -4px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "spin-slow": "spin 25s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-neon": "pulseNeon 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "radar-sweep": "radarSweep 4s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseNeon: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px #FF2D8D)" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 2px #FF2D8D)" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
