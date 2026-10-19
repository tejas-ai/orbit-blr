"use client";

import React, { useState } from "react";
import Link from "next/link";
import { OrbitEvent, EventSuggestion, AuditLogEntry } from "@/types/event";
import {
  RegistrationBadge,
  GoodiesBadge,
  CertificateBadge,
  FoodBadge,
} from "@/components/events/VerificationBadges";
import { formatEventDate, formatRelativeTime } from "@/lib/utils";
import {
  ShieldAlert,
  PlusCircle,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Search,
  History,
  Inbox,
  Sparkles,
  BarChart3,
  Calendar,
} from "lucide-react";

interface AdminDashboardClientProps {
  initialEvents: OrbitEvent[];
  suggestions: EventSuggestion[];
  auditLogs: AuditLogEntry[];
  metrics: {
    totalEvents: number;
    publishedEvents: number;
    pendingReview: number;
    openRegistrations: number;
    bothPerksConfirmed: number;
    pendingSuggestions: number;
  };
}

export default function AdminDashboardClient({
  initialEvents,
  suggestions,
  auditLogs,
  metrics,
}: AdminDashboardClientProps) {
  const [events, setEvents] = useState<OrbitEvent[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<"events" | "suggestions" | "logs">("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleTogglePublish = async (event: OrbitEvent) => {
    const nextStatus = event.publication_status === "published" ? "archived" : "published";
    setLoadingAction(event.id);
    try {
      const res = await fetch("/api/admin/events/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          action: nextStatus === "published" ? "approve" : "archive",
        }),
      });

      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, publication_status: nextStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setLoadingAction(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.reload();
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      !searchQuery ||
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || e.publication_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orbit-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-signal uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-orbit-text tracking-tight">
            ORBIT BLR Operations
          </h1>
          <p className="text-xs sm:text-sm text-orbit-muted mt-1">
            Maintain verified event inventory, review external AI imports, and manage community submissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal hover:bg-orbit-signalHover text-orbit-bg transition-all shadow-glow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Event</span>
          </Link>

          <Link
            href="/docs/ai-integration"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-mono text-orbit-text bg-orbit-surface border border-orbit-border hover:border-orbit-borderLight transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-orbit-highlight" />
            <span>AI Docs</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-orbit-subtle hover:text-rose-400 bg-orbit-surface border border-orbit-border transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-orbit-card border border-orbit-border">
          <span className="text-[11px] font-mono text-orbit-subtle block">Published Events</span>
          <span className="text-2xl font-display font-black text-orbit-signal">
            {metrics.publishedEvents}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-orbit-card border border-orbit-border">
          <span className="text-[11px] font-mono text-orbit-subtle block">Pending Review</span>
          <span className="text-2xl font-display font-black text-amber-400">
            {metrics.pendingReview}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-orbit-card border border-orbit-border">
          <span className="text-[11px] font-mono text-orbit-subtle block">Open RSVP</span>
          <span className="text-2xl font-display font-black text-emerald-400">
            {metrics.openRegistrations}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-orbit-card border border-orbit-border">
          <span className="text-[11px] font-mono text-orbit-subtle block">Swag + Cert</span>
          <span className="text-2xl font-display font-black text-orbit-highlight">
            {metrics.bothPerksConfirmed}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-orbit-card border border-orbit-border">
          <span className="text-[11px] font-mono text-orbit-subtle block">User Suggestions</span>
          <span className="text-2xl font-display font-black text-orbit-secondary">
            {metrics.pendingSuggestions}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-orbit-card border border-orbit-border">
          <span className="text-[11px] font-mono text-orbit-subtle block">Total Database</span>
          <span className="text-2xl font-display font-black text-orbit-text">
            {metrics.totalEvents}
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-orbit-border pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "events"
              ? "bg-orbit-signal text-orbit-bg font-bold"
              : "text-orbit-muted hover:text-orbit-text hover:bg-orbit-surface"
          }`}
        >
          Event Directory ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "suggestions"
              ? "bg-orbit-signal text-orbit-bg font-bold"
              : "text-orbit-muted hover:text-orbit-text hover:bg-orbit-surface"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Suggestions ({suggestions.filter((s) => s.status === "pending").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "logs"
              ? "bg-orbit-signal text-orbit-bg font-bold"
              : "text-orbit-muted hover:text-orbit-text hover:bg-orbit-surface"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Event Directory Table */}
      {activeTab === "events" && (
        <div className="space-y-4">
          {/* Table Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orbit-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event name, organizer, venue..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-orbit-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-orbit-surface border border-orbit-border text-xs font-mono text-orbit-text focus:border-orbit-signal focus:outline-none"
              >
                <option value="all">All ({events.length})</option>
                <option value="published">Published</option>
                <option value="pending_review">Pending Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-orbit-card border border-orbit-border rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-orbit-surface/80 border-b border-orbit-border text-orbit-subtle uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Event & Organizer</th>
                    <th className="py-3 px-4">Date (IST)</th>
                    <th className="py-3 px-4">Area & Venue</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Perks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orbit-border/60">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-orbit-surface/40 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          href={`/events/${evt.slug}`}
                          target="_blank"
                          className="font-bold text-orbit-text hover:text-orbit-signal transition-colors line-clamp-1 flex items-center gap-1"
                        >
                          <span>{evt.name}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                        </Link>
                        <div className="text-[11px] text-orbit-subtle mt-0.5">
                          {evt.organizer} • {evt.category}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-orbit-text font-medium">{formatEventDate(evt.start_at)}</div>
                        <div className="text-[10px] text-orbit-subtle">{formatRelativeTime(evt.last_verified_at)}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[160px]">
                        <div className="text-orbit-text font-medium truncate">{evt.venue}</div>
                        <div className="text-[11px] text-orbit-highlight">{evt.area}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <RegistrationBadge status={evt.registration_status} />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <GoodiesBadge status={evt.goodies_status} compact />
                          <CertificateBadge status={evt.certificate_status} compact />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            evt.publication_status === "published"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : evt.publication_status === "pending_review"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {evt.publication_status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(evt)}
                            disabled={loadingAction === evt.id}
                            className={`p-1.5 rounded-lg border transition-all ${
                              evt.publication_status === "published"
                                ? "text-amber-400 hover:bg-amber-400/10 border-orbit-border"
                                : "text-emerald-400 hover:bg-emerald-400/10 border-orbit-border"
                            }`}
                            title={evt.publication_status === "published" ? "Unpublish / Archive" : "Publish"}
                          >
                            {evt.publication_status === "published" ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            href={`/admin/events/${evt.id}/edit`}
                            className="p-1.5 rounded-lg text-orbit-muted hover:text-orbit-signal bg-orbit-surface border border-orbit-border transition-colors"
                            title="Edit Event"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(evt.id, evt.name)}
                            disabled={loadingAction === evt.id}
                            className="p-1.5 rounded-lg text-orbit-subtle hover:text-rose-400 bg-orbit-surface border border-orbit-border transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Suggestions Review Queue */}
      {activeTab === "suggestions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-orbit-text">
              Community Event Submissions
            </h3>
            <span className="text-xs font-mono text-orbit-muted">
              {suggestions.length} Total Submissions
            </span>
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-5 rounded-2xl bg-orbit-card border border-orbit-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-orbit-signal">
                        {sug.event_name || "Unnamed Event"}
                      </span>
                      {sug.organizer && (
                        <span className="text-xs text-orbit-subtle">
                          by {sug.organizer}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          sug.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : sug.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {sug.status}
                      </span>
                    </div>

                    <a
                      href={sug.event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-orbit-highlight hover:underline flex items-center gap-1"
                    >
                      <span>{sug.event_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {sug.notes && (
                      <p className="text-xs text-orbit-muted pt-1">
                        Notes: {sug.notes}
                      </p>
                    )}

                    {sug.submitter_email && (
                      <span className="text-[11px] font-mono text-orbit-subtle block">
                        Submitter: {sug.submitter_email}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/events/new?url=${encodeURIComponent(
                        sug.event_url
                      )}&name=${encodeURIComponent(sug.event_name || "")}&organizer=${encodeURIComponent(
                        sug.organizer || ""
                      )}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-orbit-signal text-orbit-bg hover:bg-orbit-signalHover transition-all"
                    >
                      Approve & Create Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-orbit-card border border-orbit-border rounded-2xl text-orbit-muted font-mono text-xs">
              No pending community suggestions.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-orbit-text">
            System & API Audit Log
          </h3>
          <div className="bg-orbit-card border border-orbit-border rounded-2xl p-4 divide-y divide-orbit-border/60 font-mono text-xs max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                <div>
                  <span className="text-orbit-signal font-bold uppercase mr-2">[{log.action}]</span>
                  <span className="text-orbit-text">{log.details}</span>
                  <span className="text-orbit-subtle block text-[10px] mt-0.5">
                    Actor: {log.actor} • Event ID: {log.event_id}
                  </span>
                </div>
                <span className="text-[10px] text-orbit-subtle shrink-0">
                  {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
