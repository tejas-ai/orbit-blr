"use client";

import React, { useState } from "react";
import { PlusCircle, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function SuggestEventPage() {
  const [formData, setFormData] = useState({
    event_url: "",
    event_name: "",
    organizer: "",
    notes: "",
    submitter_email: "",
    honeypot: "", // anti-spam hidden field
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam check
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Back button */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-muted hover:text-orbit-signal mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Events</span>
      </Link>

      <div className="bg-gradient-to-b from-orbit-card to-orbit-surface border border-orbit-border rounded-3xl p-6 sm:p-10 shadow-card">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-2">
          <PlusCircle className="w-4 h-4" />
          <span>Community Submissions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-orbit-text tracking-tight">
          Suggest a Free Tech Event in Bengaluru
        </h1>
        <p className="text-xs sm:text-sm text-orbit-muted mt-2 leading-relaxed">
          Know about an authentic upcoming free developer meetup, open source workshop, or AI hackathon in Bengaluru? Submit the official link below.
        </p>

        {/* Verification Guarantee Notice */}
        <div className="my-6 p-4 rounded-2xl bg-orbit-bg/80 border border-orbit-border text-xs text-orbit-muted flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-orbit-signal shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-orbit-text">Vetting Policy:</strong> Community suggestions are never published automatically. Every submission goes into our private admin queue to verify organizer authenticity, zero admission cost, and physical Bengaluru venue details.
          </p>
        </div>

        {status === "success" ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-orbit-text">
              Thank You! Suggestion Received
            </h3>
            <p className="text-xs text-orbit-muted max-w-md mx-auto leading-relaxed">
              Our team will review the organizer link and verify all admission criteria. If approved, it will go live on ORBIT BLR within 24 hours.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg"
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
              <label className="block text-xs font-mono font-semibold text-orbit-text mb-1.5">
                Official Event / Registration URL <span className="text-orbit-signal">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.event_url}
                onChange={(e) => setFormData({ ...formData, event_url: e.target.value })}
                placeholder="https://lu.ma/... or https://meetup.com/... or https://gdg.community.dev/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none focus:ring-1 focus:ring-orbit-signal text-xs font-mono text-orbit-text placeholder-orbit-subtle"
              />
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-xs font-mono font-semibold text-orbit-text mb-1.5">
                Event Name <span className="text-orbit-subtle font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                placeholder="e.g. Bangalore Python & GenAI Meetup"
                className="w-full px-3.5 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none text-xs text-orbit-text placeholder-orbit-subtle"
              />
            </div>

            {/* Organizer */}
            <div>
              <label className="block text-xs font-mono font-semibold text-orbit-text mb-1.5">
                Community / Organiser <span className="text-orbit-subtle font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g. GDG, FOSS United, CNCF, etc."
                className="w-full px-3.5 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none text-xs text-orbit-text placeholder-orbit-subtle"
              />
            </div>

            {/* Notes / Perks clues */}
            <div>
              <label className="block text-xs font-mono font-semibold text-orbit-text mb-1.5">
                Additional Notes & Verified Perks <span className="text-orbit-subtle font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mention any confirmed swags, certificates, food, or entry requirements you know about..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none text-xs text-orbit-text placeholder-orbit-subtle"
              />
            </div>

            {/* Submitter Email */}
            <div>
              <label className="block text-xs font-mono font-semibold text-orbit-text mb-1.5">
                Your Email <span className="text-orbit-subtle font-normal">(Optional, if you want notification when published)</span>
              </label>
              <input
                type="email"
                value={formData.submitter_email}
                onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })}
                placeholder="developer@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-orbit-surface border border-orbit-border focus:border-orbit-signal focus:outline-none text-xs text-orbit-text placeholder-orbit-subtle"
              />
            </div>

            {status === "error" && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all shadow-glow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{status === "submitting" ? "Submitting..." : "Submit for Verification"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
