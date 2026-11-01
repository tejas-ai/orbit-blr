# India discovery redesign

## Audit — 1 November 2026

- Branch starts at GitHub main `4691aa1`; Next.js 15.5.28, React 19, Tailwind 3, Lucide, node-postgres, NextAuth. Preserve existing authentication, saves, suggestions and detail routes.
- Live homepage/API inspected. Existing discovery has permanently exposed date chips, a welcome overlay and animated wallpaper. Cards and detail structured data hardcode free admission.
- Read-only Neon inspection: events already store timestamps, venue/address, `is_free`, `is_in_person`, sources, verification, publication status and JSON hackathon details. No city/state, explicit format, fee amount/currency or price provenance columns.
- Snapshot: 44 records (9 published, 15 pending review, 20 archived), no expired published records. The subsequent live API returned 10 records; maintenance can run concurrently. No data writes are part of this redesign.
- Admin routes are retired through middleware; retain and test the 404 guard. Do not alter maintenance automation or the retired Floot project.

## Implementation

1. Shared discovery rules for client and public API: title/topic/organiser/location search; city; mutually exclusive type, price and IST date presets. Preserve legacy query options and response shape.
2. One search, searchable location and More Filters control; draft selection, atomic Apply, scoped Reset, anchored desktop dialog and compact mobile sheet. URL and local location persistence, keyboard focus, Escape and outside click.
3. Quiet dark design, restrained category artwork, honest prices/format, verified status, preserved saves and details. Remove blocking welcome overlay from discovery.
4. Add optional read-model fields, with no production schema dependency. Separate additive SQL proposal, no migration execution or inferred fee backfill.
5. Unit tests for all combinations/time boundaries and API compatibility; build, typecheck, lint and browser tests at 320–1920px. Capture desktop/mobile/open-filter screenshots and prepare preview/PR.

## Date contract

India Standard Time (Asia/Kolkata). Today is the current IST calendar day. Next 7 days includes today plus six calendar days, ending exclusively at midnight on day eight. Weekend and Weekday match upcoming/ongoing event ranges overlapping any Saturday/Sunday or Monday–Friday respectively; not just start dates. End timestamps are exclusive for overlap. Expired and nonpublished events never appear as upcoming.

## Release gates

Production deployment and production migration require separate explicit approval. Review the additive migration and research-policy proposal before enabling India-wide ingestion. Frontend supports new fields when available; absent fee amounts stay unconfirmed, absent city is inferred only from explicit location text, never assigned to Bengaluru by default.
