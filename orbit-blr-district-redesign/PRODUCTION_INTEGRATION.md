# ORBIT BLR — Safe production integration plan

This preview was created on 20 October 2026 after reviewing District's public event-discovery experience and independently inspecting ORBIT BLR production, Neon project `broad-tooth-55681211`, and the 8 published events. It is **not** a replacement for the original Next.js repository and should not be deployed over production unmodified.

## Access limitation

During this session, attempting to create a separate Vercel preview project under team `team_txeOEuqhsyKyUBTAgWD3WcEH` returned **403 Forbidden / Not authorized for this scope**. The production deployment was intentionally left unchanged. Obtain Vercel write access for that team before deployment.

## Project integration mapping

- Main page: `src/app/page.tsx` fetches `getAllEvents({ includeUnpublished: false })` and renders `HomeClient`.
- Primary homepage presentation: `src/components/home/HomeClient.tsx`.
- Event cards and thumbnails: `src/components/events/EventCard.tsx` and `EventThumbnail.tsx`.
- Explore listing: `src/components/explore/ExploreClient.tsx`.
- Detail pages: `src/app/events/[slug]/page.tsx` and `EventDetailsActions.tsx`.
- Shared navigation/footer: `src/components/layout/Navbar.tsx`, `Footer.tsx`.
- Global tokens: `src/app/globals.css`, `tailwind.config.ts`.
- Domain data shape: `src/types/event.ts`; DB: `src/lib/db.ts`.

### Recommended sequence

1. Take a new branch and preserve the previous production deployment as a rollback point.
2. Copy the *design patterns and styles* (not the demo snapshot) into the Next.js components above. Replace the overlong cinematic hero with a compact editorial feature area and immediately visible search.
3. Add high-quality thumbnail cards; retain `thumbnail_url`, `thumbnail_alt`, source attribution, and fallback. Use approved official banners only; verify licensing/rights. Add Next image domains carefully or use ordinary remote `img` with security controls.
4. Make `Hackathons` a first-class filter. Existing event records may have category `developer` for hackathons: classify by verified event type/name/ID without modifying existing records or weakening the publication gate.
5. Add `Today`, `Tomorrow`, `This weekend`, `Next 7 days`; Bengaluru areas; confirmed-perk-only filter; keyboard-friendly search; and a saved events page. Reuse `useSavedEvents.ts` rather than creating another saved storage format without migration.
6. Redesign `/events/[slug]` to feature the original organiser image, accurate IST date/time, venue, conditional/verified perk labels, and direct official registration. Never provide an imitation checkout.
7. Retain `/about`, `/suggest`, `/saved`, event URLs, public APIs and live Neon integration.
8. Keep `publication_status = 'published'` as a hard data read condition. Original ten bogus seeds stay `pending_review`. No mock snapshot/fallback may ship to production.
9. Preserve the deployed `404` route rules for `/admin/:path*` and `/api/admin/:path*`; do not create admin routes or links.
10. Run `npx tsc --noEmit`, `npm run build`, browser checks at 390 / 768 / 1440 px, verify outgoing links and all forms, stage a **preview deployment**, then obtain approval for the production switch.
11. After production promotion check `GET https://orbit-blr.vercel.app/api/events` and 8+ currently verified public events, confirm the page renders the same published IDs, check both admin routes still 404, check canonical and Open Graph URLs match live domain, and verify venue/date/perk labels.

## Important restrictions

No changes to Neon records, organiser links, registration status, verification notes, selected/waitlisted attendees or private information are needed for a visual redesign. Do not touch the retired Floot site. Avoid publishing unsupported perks or unverified offline hackathons. The published event count is dynamic and must never be hardcoded in production.

## Deployment requirement

To complete the full redesign **in place**, provide the original `D:\Orbit Bengaluru` Next.js source ZIP (excluding `.env`, `node_modules`, `.next`, and `.git`) or connect a writable Git repo plus Vercel deploy access. Integrating against the real source is necessary to preserve all features and backend behavior.
