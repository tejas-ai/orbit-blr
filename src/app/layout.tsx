import type { Metadata, Viewport } from "next";
// Load brand fonts at runtime with font-display: swap; cloud builds require no Google Fonts API access.
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiquidWallpaper from "@/components/layout/LiquidWallpaper";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthProvider from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

import {
  SITE_URL,
  SITE_NAME,
  HOMEPAGE_TITLE,
  HOMEPAGE_DESCRIPTION,
} from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#0E0E16",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOMEPAGE_TITLE,
  description: HOMEPAGE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Bengaluru tech events",
    "Bangalore free meetups",
    "free developer events Bangalore",
    "GDG Bangalore",
    "AWS User Group Bengaluru",
    "free coding workshops Bengaluru",
    "free tech swag Bengaluru",
    "FOSS United Bangalore",
    "AI meetups Bengaluru",
    "Koramangala tech events",
    "HSR Layout hackathons",
    "Bengaluru hackathons 2026",
  ],
  authors: [{ name: "Tejas Handigol", url: "https://github.com/tejas-ai" }],
  creator: "Tejas Handigol",
  openGraph: {
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ORBIT BLR — Discover Free Tech Events & Hackathons in Bengaluru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
        />
      </head>
      <body
        className="bg-[#0E0E16] text-[#F7F5FF] font-sans antialiased selection:bg-[#6A38EB] selection:text-white min-h-screen flex flex-col overflow-x-hidden w-full max-w-full"
      >
        <ThemeProvider>
          <AuthProvider>
            <LiquidWallpaper />
            <Navbar />
            <main className="relative z-10 flex-1 w-full max-w-full overflow-x-hidden">
              {children}
            </main>
            <Footer />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
