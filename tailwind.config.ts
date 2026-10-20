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
          // Vice City meets Bengaluru — Neon After Dark Palette
          bg: "#09090B", // Deep Obsidian
          surface: "#140A26", // Midnight Violet
          surfaceHover: "#1E0F38",
          card: "#120524", // Deep Purple Card
          cardHover: "#1D0A38",
          border: "#2E1052", // Purple Border
          borderLight: "#4A1A82",
          
          // Cinematic Highlights
          signal: "#00E5FF", // Electric Cyan
          signalHover: "#33EBFF",
          signalGlow: "rgba(0, 229, 255, 0.25)",
          
          pink: "#FF2D8D", // Hot Pink
          pinkHover: "#FF4D9F",
          magenta: "#D61C8C", // Neon Magenta
          sunset: "#FF6A3D", // Sunset Orange
          gold: "#FFB347", // Warm Gold
          
          secondary: "#C084FC", // Soft Purple
          highlight: "#00E5FF", // Electric Cyan
          text: "#F8F7FC", // Soft White
          muted: "#A5B4FC", // Twilight lavender
          subtle: "#7C8BA1",
          
          danger: "#FF2D55",
          warning: "#FFB347",
          success: "#00F5A0", // Electric Emerald
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "Syne", "sans-serif"],
        body: ["var(--font-dmsans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(0, 229, 255, 0.3)",
        glowPink: "0 0 30px -5px rgba(255, 45, 141, 0.35)",
        glowCyan: "0 0 30px -5px rgba(0, 229, 255, 0.35)",
        glowSunset: "0 0 30px -5px rgba(255, 106, 61, 0.3)",
        card: "0 8px 32px -4px rgba(0, 0, 0, 0.7)",
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
