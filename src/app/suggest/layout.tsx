import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggest an Event — ORBIT BLR",
  description:
    "Submit an official free tech meetup, workshop, or hackathon in Bengaluru for 7-point verification.",
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
