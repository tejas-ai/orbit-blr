import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Saved Events — ORBIT BLR",
  description:
    "View and manage your bookmarked free tech events in Bengaluru.",
  alternates: {
    canonical: "/saved",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
