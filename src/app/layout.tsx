import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  weight: ["400", "500", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ORBIT BLR — Discover Free Tech Events & Meetups in Bengaluru",
  description:
    "Bengaluru's verified directory for 100% free, in-person technology meetups, workshops, hackathons, and professional networking. Verified swags, certificates, food, and direct registration links.",
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
  ],
  authors: [{ name: "ORBIT BLR Team" }],
  openGraph: {
    title: "ORBIT BLR — Discover Free Tech Events in Bengaluru",
    description:
      "Find genuinely free in-person developer meetups, workshops, and tech networking in Bengaluru with verified goodies, certificates, and direct official registration.",
    url: "https://orbitblr.in",
    siteName: "ORBIT BLR",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ORBIT BLR — Free Tech Events in Bengaluru",
    description:
      "Discover genuinely free tech events, meetups, and workshops in Bengaluru with verified perks.",
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
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <body
        className={`${syne.variable} ${dmSans.variable} ${plexMono.variable} bg-white text-slate-900 font-sans antialiased selection:bg-[#6A38EB] selection:text-white min-h-screen flex flex-col overflow-x-hidden w-full max-w-full`}
      >
        <Navbar />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
