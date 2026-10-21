import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, UserX } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Notice • ORBIT BLR",
  description: "Privacy-conscious practices, minimal account data collection, and analytics policy for ORBIT BLR.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-5 pb-6 sm:pt-7 sm:pb-8 bg-[#FAF9FF] dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 dark:bg-[#251D3D] text-[#6A38EB] dark:text-[#A78BFA] border border-purple-200/80 dark:border-[#382C58]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy &amp; Data Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-slate-950 dark:text-[#F7F5FF]">
            Privacy Notice
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#CBD5E1]">
            Last updated: October 2026 • ORBIT BLR is built on transparency, minimal data collection, and privacy respect.
          </p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {/* Card 1: Account Data */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1D1B2C] border border-purple-100/80 dark:border-[#302B43] shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-[#251D3D] flex items-center justify-center text-[#6A38EB] dark:text-[#A78BFA]">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-[#F7F5FF]">
                1. Optional Authentication &amp; Minimal Data
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              Browsing, searching, and registering for events on ORBIT BLR requires <strong>no account</strong>. If you voluntarily choose to sign in with GitHub, we request only the bare minimum profile information:
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] space-y-1.5 pl-2">
              <li><strong>Display Name</strong> (to personalise your header greeting)</li>
              <li><strong>Email Address</strong> (for account identification and login)</li>
              <li><strong>Profile Picture URL</strong> (to display your avatar in the navbar)</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] italic pt-1">
              We never access your passwords, private repositories, contacts, or background data.
            </p>
          </div>

          {/* Card 2: Analytics */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1D1B2C] border border-purple-100/80 dark:border-[#302B43] shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-[#251D3D] flex items-center justify-center text-[#6A38EB] dark:text-[#A78BFA]">
                <EyeOff className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-[#F7F5FF]">
                2. Privacy-Conscious Web Analytics
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              We use <strong>Vercel Web Analytics</strong> to measure high-level trends such as page views, popular event categories, and device types (desktop vs. mobile).
            </p>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] space-y-1 pl-2">
              <li>No invasive cross-site tracking or third-party advertising cookies.</li>
              <li>All metrics are aggregated to protect visitor anonymity.</li>
              <li>We do not correlate anonymous page visits with personal user identities.</li>
            </ul>
          </div>

          {/* Card 3: Saved Events */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1D1B2C] border border-purple-100/80 dark:border-[#302B43] shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-[#251D3D] flex items-center justify-center text-[#6A38EB] dark:text-[#A78BFA]">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-[#F7F5FF]">
                3. Bookmarks &amp; Saved Events
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              When not signed in, saved events are stored entirely in your browser&apos;s local storage. When signed in, bookmarks can synchronize to your account across devices. Your saved events are strictly private and never publicly broadcast.
            </p>
          </div>

          {/* Card 4: Data Rights & Account Deletion */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1D1B2C] border border-purple-100/80 dark:border-[#302B43] shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-[#251D3D] flex items-center justify-center text-[#6A38EB] dark:text-[#A78BFA]">
                <UserX className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-[#F7F5FF]">
                4. Account Removal &amp; Data Deletion
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              You maintain full control of your information. You may sign out at any time or request immediate, permanent deletion of your user record and saved events from our database by contacting the ORBIT BLR community team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
