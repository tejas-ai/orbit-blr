import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggest an Event — ORBIT BLR",
  description:
    "Submit an official tech event, workshop, or hackathon in India for 7-point verification.",
  alternates: {
    canonical: "/suggest",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SuggestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
