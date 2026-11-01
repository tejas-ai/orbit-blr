import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolate QA builds from a developer's concurrently running Next dev server.
  distDir: process.env.ORBIT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["pg"],
  async redirects() {
    return [{
      source: "/explore",
      has: [{ type: "query" as const, key: "category", value: "Hackathons" }],
      destination: "/hackathons",
      permanent: false,
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
