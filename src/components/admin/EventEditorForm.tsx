"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OrbitEvent, EventCategory, RegistrationStatus, BenefitStatus, FoodStatus, PublicationStatus, VenueType, CATEGORIES, BENGALURU_AREAS } from "@/types/event";
import { ArrowLeft, Save, Plus, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

interface EventEditorFormProps {
  initialEvent?: OrbitEvent | null;
  isNew?: boolean;
}

export default function EventEditorForm({ initialEvent, isNew = false }: EventEditorFormProps) {
  const router = useRouter();

  // Helper to format ISO string to local input value "YYYY-MM-DDTHH:mm"
  const toInputDate = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState<Partial<OrbitEvent>>({
    id: initialEvent?.id || `evt-${Date.now()}`,
    slug: initialEvent?.slug || "",
    name: initialEvent?.name || "",
    category: initialEvent?.category || "Developer",
    organizer: initialEvent?.organizer || "",
    description: initialEvent?.description || "",
    start_at: initialEvent?.start_at ? toInputDate(initialEvent.start_at) : toInputDate(new Date(Date.now() + 86400000 * 7).toISOString()),
    end_at: initialEvent?.end_at ? toInputDate(initialEvent.end_at) : toInputDate(new Date(Date.now() + 86400000 * 7 + 14400000).toISOString()),
    timezone: initialEvent?.timezone || "Asia/Kolkata",
    venue: initialEvent?.venue || "",
    venue_type: initialEvent?.venue_type || "Technology HQ / Campus",
    area: initialEvent?.area || "Koramangala",
    address: initialEvent?.address || "",
    landmark: initialEvent?.landmark || "",
    metro_station: initialEvent?.metro_station || "",
    map_url: initialEvent?.map_url || "",
    is_in_person: true,
    is_free: true,
    registration_url: initialEvent?.registration_url || "",
    registration_status: initialEvent?.registration_status || "open",
    approval_required: initialEvent?.approval_required || false,
    goodies_status: initialEvent?.goodies_status || "unverified",
    goodies_details: initialEvent?.goodies_details || "",
    certificate_status: initialEvent?.certificate_status || "not_provided",
    certificate_format: initialEvent?.certificate_format || "none",
    certificate_requirements: initialEvent?.certificate_requirements || "",
    food_status: initialEvent?.food_status || "unverified",
    food_details: initialEvent?.food_details || "",
    source_urls: initialEvent?.source_urls?.length ? initialEvent.source_urls : [""],
    verification_notes: initialEvent?.verification_notes || "",
    publication_status: initialEvent?.publication_status || "published",
    featured: initialEvent?.featured || false,
  });

  const [sourceUrlInput, setSourceUrlInput] = useState(
    initialEvent?.source_urls?.join("\n") || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.registration_url) {
      setError("Event name and Registration URL are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const parsedSources = sourceUrlInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        start_at: new Date(formData.start_at!).toISOString(),
        end_at: new Date(formData.end_at!).toISOString(),
        source_urls: parsedSources,
        last_verified_at: new Date().toISOString(),
      };

      const endpoint = isNew ? "/api/admin/events" : `/api/admin/events/${initialEvent?.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save event");
      }
    } catch {
      setError("Network error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-orbit-border/80 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl text-orbit-muted hover:text-orbit-text bg-orbit-surface border border-orbit-border"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-black text-orbit-text">
              {isNew ? "Create Verified Tech Event" : `Edit Event: ${initialEvent?.name}`}
            </h1>
            <span className="text-xs font-mono text-orbit-muted">
              Authoritative Event Inventory Form
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all shadow-glow disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save & Publish"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Information */}
      <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-orbit-signal font-bold">
          1. Basic Event Details
        </h2>

        <div>
          <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
            Event Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. GDG Bengaluru: Gemini 1.5 Architecture Summit"
            className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Official Organizer *
            </label>
            <input
              type="text"
              required
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              placeholder="e.g. Google Developer Group Bangalore"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Full technical description, agenda highlights, and audience scope..."
            className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
          />
        </div>
      </div>

      {/* Timing and Venue */}
      <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-orbit-highlight font-bold">
          2. Bengaluru Venue & Timing (IST)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Start Time (IST) *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.start_at}
              onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              End Time (IST) *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.end_at}
              onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Bengaluru Area *
            </label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              {BENGALURU_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Google India, RMZ Infinity"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Full Physical Address
            </label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Building, street, pincode"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Nearest Namma Metro Station
            </label>
            <input
              type="text"
              value={formData.metro_station || ""}
              onChange={(e) => setFormData({ ...formData, metro_station: e.target.value })}
              placeholder="e.g. Baiyappanahalli Metro (Purple Line) - 800m"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Registration & URL */}
      <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-emerald-400 font-bold">
          3. Registration & Access
        </h2>

        <div>
          <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
            Official Direct Registration URL *
          </label>
          <input
            type="url"
            required
            value={formData.registration_url}
            onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
            placeholder="https://official-registration-link.com/..."
            className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Registration Status *
            </label>
            <select
              value={formData.registration_status}
              onChange={(e) => setFormData({ ...formData, registration_status: e.target.value as RegistrationStatus })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="open">Registration Open</option>
              <option value="approval_required">Approval Required</option>
              <option value="waitlist">Waitlist</option>
              <option value="full">Capacity Full</option>
              <option value="closed">Closed</option>
              <option value="not_yet_open">Not Yet Open</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-orbit-text">
              <input
                type="checkbox"
                checked={formData.approval_required}
                onChange={(e) => setFormData({ ...formData, approval_required: e.target.checked })}
                className="w-4 h-4 rounded text-orbit-signal focus:ring-0 bg-orbit-surface border-orbit-border cursor-pointer"
              />
              <span>Approval / RSVP Vetting Required</span>
            </label>
          </div>
        </div>
      </div>

      {/* Verified Perks Matrix */}
      <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-orbit-secondary font-bold">
          4. Verified Attendee Perks Matrix
        </h2>

        {/* Goodies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Free Goodies Status
            </label>
            <select
              value={formData.goodies_status}
              onChange={(e) => setFormData({ ...formData, goodies_status: e.target.value as BenefitStatus })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="confirmed">Confirmed for Attendees</option>
              <option value="limited">Limited / Raffle-based</option>
              <option value="not_provided">Not Provided</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Goodies Details
            </label>
            <input
              type="text"
              value={formData.goodies_details || ""}
              onChange={(e) => setFormData({ ...formData, goodies_details: e.target.value })}
              placeholder="e.g. Official T-shirt, laptop stickers, and cloud credits"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>

        {/* Certificate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Certificate Status
            </label>
            <select
              value={formData.certificate_status}
              onChange={(e) => setFormData({ ...formData, certificate_status: e.target.value as BenefitStatus })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="confirmed">Confirmed</option>
              <option value="conditional">Conditional (Lab / Quiz required)</option>
              <option value="not_provided">Not Provided</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Certificate Requirements / Format
            </label>
            <input
              type="text"
              value={formData.certificate_requirements || ""}
              onChange={(e) => setFormData({ ...formData, certificate_requirements: e.target.value })}
              placeholder="e.g. Digital badge issued upon QR check-in"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>

        {/* Food */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Food & Refreshments
            </label>
            <select
              value={formData.food_status}
              onChange={(e) => setFormData({ ...formData, food_status: e.target.value as FoodStatus })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="complimentary_meals_confirmed">Complimentary Meals Confirmed</option>
              <option value="refreshments_confirmed">Refreshments / Snacks Confirmed</option>
              <option value="paid">Paid Dining</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Food Details
            </label>
            <input
              type="text"
              value={formData.food_details || ""}
              onChange={(e) => setFormData({ ...formData, food_details: e.target.value })}
              placeholder="e.g. Buffet lunch, high tea, filter coffee"
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Verification Evidence & Status */}
      <div className="p-6 rounded-2xl bg-orbit-card border border-orbit-border space-y-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-orbit-subtle font-bold">
          5. Verification Evidence & Publishing
        </h2>

        <div>
          <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
            Verification Source URLs (One URL per line)
          </label>
          <textarea
            rows={3}
            value={sourceUrlInput}
            onChange={(e) => setSourceUrlInput(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
            Verification Notes
          </label>
          <input
            type="text"
            value={formData.verification_notes || ""}
            onChange={(e) => setFormData({ ...formData, verification_notes: e.target.value })}
            placeholder="e.g. Directly confirmed via GDG lead email"
            className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs text-orbit-text focus:border-orbit-signal focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-mono text-orbit-text font-semibold mb-1">
              Publication Status
            </label>
            <select
              value={formData.publication_status}
              onChange={(e) => setFormData({ ...formData, publication_status: e.target.value as PublicationStatus })}
              className="w-full px-3.5 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
            >
              <option value="published">Published</option>
              <option value="pending_review">Pending Review</option>
              <option value="archived">Archived</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-orbit-text">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-orbit-signal focus:ring-0 bg-orbit-surface border-orbit-border cursor-pointer"
              />
              <span>Spotlight on Home Page (Featured)</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
