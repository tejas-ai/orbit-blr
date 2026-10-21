"use client";

import React, { useState } from "react";
import { PlusCircle, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function SuggestEventPage() {
  const [formData, setFormData] = useState({
    event_url: "",
    event_name: "",
    organizer: "",
    notes: "",
    submitter_email: "",
    honeypot: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) {
      setStatus("success");
      return;
    }

    if (!formData.event_url || !formData.event_url.startsWith("http")) {
      setStatus("error");
      setErrorMessage("Please enter a valid official event URL starting with http:// or https://");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_url: formData.event_url,
          event_name: formData.event_name,
          organizer: formData.organizer,
          notes: formData.notes,
          submitter_email: formData.submitter_email,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({
          event_url: "",
          event_name: "",
          organizer: "",
          notes: "",
          submitter_email: "",
          honeypot: "",
        });
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-4 pb-6 sm:pt-6 sm:pb-8 px-4 bg-white dark:bg-[#0E0E16] text-slate-900 dark:text-[#F7F5FF] transition-colors duration-300">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#CBD5E1] hover:text-[#6A38EB] dark:hover:text-[#A78BFA] mb-4 transition-colors font-medium"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Events</span>
      </Link>

      <ScrollReveal direction="down" className="bg-white dark:bg-[#1D1B2C] border border-slate-200/90 dark:border-[#302B43] rounded-3xl p-6 sm:p-10 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6A38EB] dark:text-[#A78BFA] uppercase tracking-wider mb-2">
          <PlusCircle className="w-4 h-4" />
          <span>Community Submissions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-[#F7F5FF] tracking-tight font-serif">
          Suggest a Free Tech Event in Bengaluru
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] mt-2 leading-relaxed">
          Know about an authentic upcoming free developer meetup, open source workshop, or AI hackathon in Bengaluru? Submit the official link below.
        </p>

        {/* Verification Guarantee Notice */}
        <div className="my-6 p-4 rounded-2xl bg-purple-50/50 dark:bg-[#151522] border border-purple-100 dark:border-[#302B43] text-xs text-slate-600 dark:text-[#CBD5E1] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-[#F7F5FF]">Vetting Policy:</strong> Community suggestions are never published automatically. Every submission enters our verification review queue to verify organizer authenticity, zero admission cost, and physical Bengaluru venue details.
          </p>
        </div>

        {status === "success" ? (
          <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-950 dark:text-[#F7F5FF] font-serif">
              Thank You! Suggestion Received
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
              Our team will review the organizer link and verify all admission criteria. If approved, it will go live on ORBIT BLR within 24 hours.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white transition-all shadow-sm"
              >
                Submit Another Event
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot anti-spam (hidden) */}
            <input
              type="text"
              name="website"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Official Registration URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#F7F5FF] mb-1.5">
                Official Event / Registration URL <span className="text-[#6A38EB] dark:text-[#A78BFA]">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.event_url}
                onChange={(e) => setFormData({ ...formData, event_url: e.target.value })}
                placeholder="https://lu.ma/... or https://meetup.com/... or https://gdg.community.dev/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] focus:border-[#6A38EB] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#151522] focus:outline-none text-xs text-slate-900 dark:text-[#F7F5FF] placeholder:text-slate-400 dark:placeholder:text-[#CBD5E1]/50 transition-colors"
              />
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#F7F5FF] mb-1.5">
                Event Name <span className="text-slate-400 dark:text-[#CBD5E1]/70 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                placeholder="e.g. Bangalore Python & GenAI Meetup"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] focus:border-[#6A38EB] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#151522] focus:outline-none text-xs text-slate-900 dark:text-[#F7F5FF] placeholder:text-slate-400 dark:placeholder:text-[#CBD5E1]/50 transition-colors"
              />
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#F7F5FF] mb-1.5">
                Community / Organiser <span className="text-slate-400 dark:text-[#CBD5E1]/70 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g. GDG, FOSS United, CNCF, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] focus:border-[#6A38EB] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#151522] focus:outline-none text-xs text-slate-900 dark:text-[#F7F5FF] placeholder:text-slate-400 dark:placeholder:text-[#CBD5E1]/50 transition-colors"
              />
            </div>

            {/* Notes / Perks clues */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#F7F5FF] mb-1.5">
                Additional Notes &amp; Verified Perks <span className="text-slate-400 dark:text-[#CBD5E1]/70 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mention any confirmed swags, certificates, food, or entry requirements you know about..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] focus:border-[#6A38EB] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#151522] focus:outline-none text-xs text-slate-900 dark:text-[#F7F5FF] placeholder:text-slate-400 dark:placeholder:text-[#CBD5E1]/50 transition-colors"
              />
            </div>

            {/* Submitter Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-[#F7F5FF] mb-1.5">
                Your Email <span className="text-slate-400 dark:text-[#CBD5E1]/70 font-normal">(Optional, for notification when published)</span>
              </label>
              <input
                type="email"
                value={formData.submitter_email}
                onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#151522] border border-slate-200 dark:border-[#302B43] focus:border-[#6A38EB] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#151522] focus:outline-none text-xs text-slate-900 dark:text-[#F7F5FF] placeholder:text-slate-400 dark:placeholder:text-[#CBD5E1]/50 transition-colors"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#6A38EB] hover:bg-[#5826D4] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] text-white shadow-sm transition-all disabled:opacity-50 active:scale-95"
              >
                {status === "submitting" ? (
                  <span>Submitting for Review...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Independent Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </ScrollReveal>
    </div>
  );
}
