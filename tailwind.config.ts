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
          bg: "#070A12",
          surface: "#111827",
          card: "#0D1322",
          cardHover: "#131C31",
          border: "#1E293B",
          borderLight: "#334155",
          signal: "#CAFD79",
          signalHover: "#B9EC66",
          signalGlow: "rgba(202, 253, 121, 0.2)",
          secondary: "#A5B4FC",
          highlight: "#67E8F9",
          text: "#F3F6FA",
          muted: "#94A3B8",
          subtle: "#64748B",
          danger: "#F43F5E",
          warning: "#F59E0B",
          success: "#10B981",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "Syne", "sans-serif"],
        body: ["var(--font-dmsans)", "DM Sans", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(202, 253, 121, 0.25)",
        glowCyan: "0 0 25px -5px rgba(103, 232, 249, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
