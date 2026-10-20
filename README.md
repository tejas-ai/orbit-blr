# ORBIT BLR 🚀

**Discover. Connect. Build.**  
*The Verified Directory for Genuinely Free, In-Person Technology & Professional Networking Events in Bengaluru, Karnataka, India.*

---

## 🌟 Mission & Overview

**ORBIT BLR** is built specifically for Bengaluru's vibrant student, developer, hacker, and researcher ecosystem. Instead of wasting hours sifting through fragmented websites, misleading "free-tier" tickets with hidden fees, or unverified claims, ORBIT BLR provides an authoritative, vetted source of truth for free in-person technical meetups and workshops.

### Key Pillars:
1. **100% Free Entry:** Non-negotiable. Only events with genuinely zero-cost admission are published.
2. **Physical Bengaluru Premises:** In-person venues with exact addresses, landmarks, and nearest Namma Metro stations.
3. **Verified Perk Transparency:** Goodies/Swags, Certificates, and Food/Refreshments are individually audited as **Confirmed**, **Limited/Raffle**, **Conditional**, or **Unverified**.
4. **Direct Registration Links:** No affiliate redirects or generic community homepages—direct access to the official RSVP portal.
5. **Interactive 3D Radar:** WebGL Three.js orbital globe visualizing active Bengaluru technology nodes (AI & ML, Cloud, Open Source, Cybersecurity, Robotics, and Founder mixers).

---

## 🏗️ Architecture & Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Runtime:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Visual & UI:** [Tailwind CSS](https://tailwindcss.com/) with custom Deep Space Dark theme (`#070A12`, elevated surfaces `#111827`, signal accent `#CAFD79`, highlights `#67E8F9`)
- **3D Interactive Centerpiece:** [Three.js](https://threejs.org/) interactive WebGL canvas with raycasting nodes, orbital rings, particle cloud, and low-power responsive fallback
- **Icons:** [Lucide React](https://lucide.dev/)
- **Typography:** Syne (display headings), DM Sans (body copy), and IBM Plex Mono (technical metadata)
- **Database:**
  - **Local / Default:** Zero-config high-performance SQLite via Node.js native `DatabaseSync` (`./data/orbit.db`)
  - **Cloud / Production:** Ready for PostgreSQL / Supabase / Neon using the included `schema.sql` migration script
- **SEO & Structured Data:** Semantic HTML5, Schema.org `Event` JSON-LD markup for rich Google search snippets, dynamic `sitemap.xml`, and `robots.txt`.

---

## 🚀 Quick Start & Local Development

### Prerequisites:
- Node.js `v20+` or `v22+` / `v24+`
- npm `v10+`

### Installation:

```bash
# Clone or navigate to the project directory
cd "Orbit Bengaluru"

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production Run:

```bash
npm run build
npm start
```

---

## 🔐 Admin Dashboard & Operations

The platform includes a private, authenticated administrative operations console:

- **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Password:** Configured securely via `ORBIT_ADMIN_PASSWORD` environment variable

### Capabilities:
- **Event Lifecycle:** Create, edit, publish, unpublish, or delete events.
- **Perk Evidence Matrix:** Record organizer proof for t-shirts, stickers, certificates, and complimentary food.
- **Audit Logging:** Immutably records every creation, status change, and automated import.
- **Community Review Queue:** Review public submissions received via `/suggest`.

---

## 🤖 External AI / ChatGPT Integration API

ORBIT BLR provides a dedicated, authenticated REST API designed so external AI agents (like ChatGPT, Claude, or custom scrapers) can discover and sync events automatically.

### API Endpoints:

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Retrieve published upcoming events with filters |
| `GET` | `/api/admin/events` | Bearer Token | Retrieve all events including draft & pending reviews |
| `POST` | `/api/admin/events/import` | Bearer Token | **Bulk import/upsert with deduplication** |
| `POST` | `/api/admin/events/review` | Bearer Token | Approve, reject, or archive events |
| `POST` | `/api/admin/events/status` | Bearer Token | Quick update of registration status or perk evidence |
| `POST` | `/api/suggest` | Public + Honeypot | Community event suggestion pipeline |

### Bulk Ingestion Example (cURL):

```bash
curl -X POST http://localhost:3000/api/admin/events/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ORBIT_API_SECRET>" \
  -d '{
    "events": [
      {
        "name": "GDG Bengaluru: GenAI Summit",
        "category": "AI & ML",
        "organizer": "Google Developer Group Bangalore",
        "description": "Production GenAI architectures on Vertex AI.",
        "start_at": "2026-10-25T10:30:00+05:30",
        "end_at": "2026-10-25T14:30:00+05:30",
        "venue": "Google India, RMZ Infinity",
        "area": "Old Madras Road",
        "registration_url": "https://gdg.community.dev/events/details/developer-group-bangalore-presents-genai-production-summit/",
        "registration_status": "open",
        "goodies_status": "confirmed",
        "goodies_details": "Official GDG t-shirts and stickers",
        "certificate_status": "confirmed",
        "food_status": "complimentary_meals_confirmed",
        "source_urls": ["https://gdg.community.dev/gdg-bangalore/"],
        "publication_status": "published"
      }
    ]
  }'
```

*Note: If an event with the same `registration_url` or `slug` already exists, the API will idempotently update the record rather than creating duplicates.*

---

## 🧪 Testing & Verification Suite

ORBIT BLR includes a verification test suite:

```bash
# Verify database schema, seed data, and deduplication logic
node tests/verify-system.mjs

# Verify all live HTTP API endpoints against running server
node tests/test-live-api.mjs
```

---

## 🚢 Deployment Guide

### Deploying to Vercel:
1. Connect your GitHub repository to Vercel.
2. Add environment variables:
   - `ORBIT_ADMIN_PASSWORD`: Your chosen secure admin dashboard password
   - `ORBIT_API_SECRET`: Secret token for automated AI updates
   - `NEXT_PUBLIC_APP_URL`: Your live domain (e.g., `https://orbit-blr.vercel.app`)
3. For cloud databases, configure `DATABASE_URL` with your Supabase or Neon PostgreSQL connection string and run `schema.sql`.

---

## 📄 License & Disclaimer

ORBIT BLR is an independent directory built for the Bengaluru developer community. We are not officially affiliated with Google, AWS, Microsoft, Cisco, or any listed event organizers. All trademarks belong to their respective owners.
