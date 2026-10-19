import React from "react";
import { Metadata } from "next";
import {
  Terminal,
  ShieldCheck,
  Key,
  Copy,
  CheckCircle2,
  FileCode,
  Sparkles,
  RefreshCw,
  Cpu,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI & ChatGPT Automation API Guide — ORBIT BLR",
  description:
    "Complete developer and automation guide for ingesting verified Bengaluru events into ORBIT BLR via authorized ChatGPT prompts, Python scripts, or scheduled webhooks.",
};

export default function AiIntegrationDocsPage() {
  const exampleJson = `{
  "events": [
    {
      "id": "evt-gdg-genai-blr",
      "slug": "gdg-bengaluru-gemini-vertex-ai-summit",
      "name": "GDG Bengaluru: Building Production GenAI with Gemini 1.5 & Vertex AI",
      "category": "AI & ML",
      "organizer": "Google Developer Group Bangalore",
      "description": "Deep dive into production architectures for LLM systems, multimodal reasoning with Gemini 1.5 Pro, and building autonomous agentic workflows on Vertex AI.",
      "start_at": "2026-10-25T10:30:00+05:30",
      "end_at": "2026-10-25T14:30:00+05:30",
      "timezone": "Asia/Kolkata",
      "venue": "Google India, RMZ Infinity",
      "venue_type": "Technology HQ / Campus",
      "area": "Old Madras Road",
      "address": "Tower D, RMZ Infinity, No. 3, Bennigana Halli, Old Madras Road, Bengaluru 560016",
      "is_in_person": true,
      "is_free": true,
      "registration_url": "https://gdg.community.dev/events/details/developer-group-bangalore-presents-genai-production-summit/",
      "registration_status": "approval_required",
      "approval_required": true,
      "goodies_status": "confirmed",
      "goodies_details": "Official GDG t-shirts, stickers pack, and Google Cloud credit vouchers.",
      "certificate_status": "confirmed",
      "certificate_format": "digital",
      "certificate_requirements": "Issued via Google Developers Credential profile upon QR check-in.",
      "food_status": "complimentary_meals_confirmed",
      "food_details": "Catered Indian buffet lunch, afternoon high-tea, and refreshments.",
      "source_urls": ["https://gdg.community.dev/gdg-bangalore/"],
      "verification_notes": "Directly verified via GDG Bangalore official portal.",
      "last_verified_at": "2026-10-19T10:00:00+05:30",
      "publication_status": "published"
    }
  ]
}`;

  const curlExample = `curl -X POST https://orbitblr.in/api/admin/events/import \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ORBIT_API_SECRET" \\
  -d '${exampleJson.replace(/\n/g, "")}'`;

  const pythonScript = `import os
import requests

API_URL = "https://orbitblr.in/api/admin/events/import"
API_SECRET = os.environ["ORBIT_API_SECRET"]  # Configured in your secure environment

payload = {
    "events": [
        {
            "name": "FOSS United Bangalore Monthly Meetup",
            "category": "Developer",
            "organizer": "FOSS United",
            "description": "Monthly gathering of open source contributors and systems hackers.",
            "start_at": "2026-10-24T10:00:00+05:30",
            "end_at": "2026-10-24T13:30:00+05:30",
            "venue": "Zerodha HQ, Dollars Colony",
            "area": "JP Nagar / Jayanagar",
            "registration_url": "https://fossunited.org/events/bangalore-monthly",
            "registration_status": "open",
            "goodies_status": "confirmed",
            "goodies_details": "FOSS United mascot stickers and pins.",
            "certificate_status": "not_provided",
            "food_status": "refreshments_confirmed",
            "food_details": "Evening chai, samosas and filter coffee.",
            "source_urls": ["https://fossunited.org/events/bengaluru"],
            "publication_status": "published"
        }
    ]
}

headers = {
    "Authorization": f"Bearer {API_SECRET}",
    "Content-Type": "application/json"
}

response = requests.post(API_URL, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Result:", response.json())`;

  const chatGptInstructions = `You are the Official Event Researcher and Ingestion Agent for ORBIT BLR (Bengaluru Free In-Person Tech Directory).

Your task is to:
1. Search for newly announced free in-person developer meetups, workshops, or hackathons in Bengaluru (from GDG, AWS User Group, CNCF, BangPypers, FOSS United, Luma, React Bangalore).
2. Verify:
   - Is admission 100% free? (Mandatory)
   - Is it in-person in Bengaluru? (Mandatory)
   - Exact physical venue and area (e.g. Koramangala, HSR Layout, Whitefield, etc.).
   - Exact start and end times in IST (Asia/Kolkata).
   - What attendee perks are verified (Goodies, Certificate, Food)? Do not invent or assume perks.
3. Construct the JSON payload adhering to the Orbit BLR import schema.
4. Issue an HTTP POST to:
   POST /api/admin/events/import
   Header: Authorization: Bearer YOUR_ORBIT_API_SECRET
   Body: { "events": [...] }

If the event already exists with the same registration_url or slug, the API will idempotently update the record and log an audit trail.`;

  return (
    <div className="space-y-12 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-orbit-border/80 pb-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-orbit-highlight uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Automation Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-orbit-text tracking-tight">
          External AI & ChatGPT Update Integration Guide
        </h1>
        <p className="text-base sm:text-lg text-orbit-muted leading-relaxed">
          ORBIT BLR provides a high-performance, authenticated API designed so external AI agents (like ChatGPT, Claude, or custom scrapers) can maintain the event directory reliably and securely.
        </p>
      </div>

      {/* Security & Authentication Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-orbit-card border border-orbit-border space-y-2">
          <div className="flex items-center gap-2 text-orbit-signal font-mono text-xs font-bold">
            <Key className="w-4 h-4" />
            <span>Bearer Auth</span>
          </div>
          <h3 className="font-display font-bold text-base text-orbit-text">Secret Token Protected</h3>
          <p className="text-xs text-orbit-muted leading-relaxed">
            All write operations require an <code className="text-orbit-signal font-mono">Authorization: Bearer &lt;ORBIT_API_SECRET&gt;</code> header. Configured safely via server environment variables.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-orbit-card border border-orbit-border space-y-2">
          <div className="flex items-center gap-2 text-orbit-highlight font-mono text-xs font-bold">
            <RefreshCw className="w-4 h-4" />
            <span>Idempotent Upsert</span>
          </div>
          <h3 className="font-display font-bold text-base text-orbit-text">Deduplication by Default</h3>
          <p className="text-xs text-orbit-muted leading-relaxed">
            Submitting an event with an existing <code className="text-orbit-highlight font-mono">registration_url</code> or <code className="text-orbit-highlight font-mono">slug</code> automatically updates details rather than creating duplicates.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-orbit-card border border-orbit-border space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail Log</span>
          </div>
          <h3 className="font-display font-bold text-base text-orbit-text">Full Operational Trace</h3>
          <p className="text-xs text-orbit-muted leading-relaxed">
            Every creation, update, and review state is immutably logged with timestamp, actor tag, and field change summaries in our database audit log.
          </p>
        </div>
      </div>

      {/* Endpoints Reference Table */}
      <section className="bg-orbit-card border border-orbit-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-card">
        <h2 className="text-xl font-display font-bold text-orbit-text">API Endpoints Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-orbit-surface border-b border-orbit-border text-orbit-subtle uppercase">
              <tr>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Auth</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orbit-border/60 text-orbit-text">
              <tr>
                <td className="py-3 px-4 text-orbit-signal font-bold">GET</td>
                <td className="py-3 px-4 font-semibold">/api/events</td>
                <td className="py-3 px-4 text-emerald-400">Public</td>
                <td className="py-3 px-4 text-orbit-muted">Retrieve upcoming published events with category/search filters.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-orbit-signal font-bold">GET</td>
                <td className="py-3 px-4 font-semibold">/api/admin/events</td>
                <td className="py-3 px-4 text-amber-400">Bearer Token</td>
                <td className="py-3 px-4 text-orbit-muted">Retrieve all events including draft, pending, and archived states.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-orbit-highlight font-bold">POST</td>
                <td className="py-3 px-4 font-semibold">/api/admin/events/import</td>
                <td className="py-3 px-4 text-amber-400">Bearer Token</td>
                <td className="py-3 px-4 text-orbit-muted">Bulk create or update events from structured JSON feed.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-orbit-highlight font-bold">POST</td>
                <td className="py-3 px-4 font-semibold">/api/admin/events/review</td>
                <td className="py-3 px-4 text-amber-400">Bearer Token</td>
                <td className="py-3 px-4 text-orbit-muted">Approve, reject, or archive pending events.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-orbit-highlight font-bold">POST</td>
                <td className="py-3 px-4 font-semibold">/api/admin/events/status</td>
                <td className="py-3 px-4 text-amber-400">Bearer Token</td>
                <td className="py-3 px-4 text-orbit-muted">Quick update of registration status or benefit verification notes.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-purple-400 font-bold">POST</td>
                <td className="py-3 px-4 font-semibold">/api/suggest</td>
                <td className="py-3 px-4 text-emerald-400">Public + Honeypot</td>
                <td className="py-3 px-4 text-orbit-muted">Community event suggestion endpoint.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* JSON Schema Code Example */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-orbit-text flex items-center gap-2">
            <FileCode className="w-5 h-5 text-orbit-signal" />
            <span>Canonical Import Schema (JSON)</span>
          </h2>
          <span className="text-xs font-mono text-orbit-subtle">Strict Schema Validation</span>
        </div>
        <pre className="p-4 sm:p-6 rounded-2xl bg-orbit-surface border border-orbit-border font-mono text-xs text-orbit-text overflow-x-auto leading-relaxed scrollbar-thin">
          {exampleJson}
        </pre>
      </section>

      {/* cURL Request */}
      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-orbit-text flex items-center gap-2">
          <Terminal className="w-4 h-4 text-orbit-highlight" />
          <span>cURL Command Example</span>
        </h2>
        <pre className="p-4 rounded-xl bg-orbit-surface border border-orbit-border font-mono text-xs text-orbit-highlight overflow-x-auto">
          {curlExample}
        </pre>
      </section>

      {/* Python Script */}
      <section className="space-y-3">
        <h2 className="text-lg font-display font-bold text-orbit-text flex items-center gap-2">
          <FileCode className="w-4 h-4 text-orbit-secondary" />
          <span>Python Automation Script</span>
        </h2>
        <pre className="p-4 rounded-xl bg-orbit-surface border border-orbit-border font-mono text-xs text-orbit-text overflow-x-auto leading-relaxed">
          {pythonScript}
        </pre>
      </section>

      {/* ChatGPT Custom GPT Instructions */}
      <section className="bg-gradient-to-br from-orbit-card to-orbit-surface border border-orbit-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-card">
        <div className="flex items-center gap-2 text-orbit-signal font-mono text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>ChatGPT Custom GPT Integration</span>
        </div>
        <h2 className="text-xl font-display font-bold text-orbit-text">
          How to Connect ChatGPT to ORBIT BLR
        </h2>
        <p className="text-xs text-orbit-muted leading-relaxed">
          Create a Custom GPT in OpenAI ChatGPT with Web Browsing and Actions enabled. Paste the following system instructions into your Custom GPT:
        </p>
        <pre className="p-4 rounded-xl bg-orbit-surface border border-orbit-border font-mono text-xs text-orbit-text whitespace-pre-wrap leading-relaxed">
          {chatGptInstructions}
        </pre>
        <p className="text-xs text-orbit-subtle pt-2">
          In your ChatGPT Action setup, configure Authentication as <strong>API Key</strong> (Auth Type: Bearer) and paste your secret <code className="text-orbit-signal">ORBIT_API_SECRET</code>.
        </p>
      </section>
    </div>
  );
}
