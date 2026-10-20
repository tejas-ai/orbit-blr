# ORBIT BLR — District-inspired UX redesign preview

This is a **non-production, read-only interactive front-end prototype** for the existing ORBIT BLR project.

## Preview locally

```
python3 -m http.server 8080
```

Open http://localhost:8080.

The preview includes a snapshot of the 8 publicly published events on 20 October 2026. When permitted, it fetches `https://orbit-blr.vercel.app/api/events` for fresh event data (cross-origin access may be blocked by browser CORS). If a same-origin `/api/events` endpoint exists, it is tried first.

## Features

- Premium District-inspired but distinct ORBIT BLR visual identity
- Responsive home page, search, featured card, event gallery
- Quick date filters (Today, Tomorrow, Weekend, Next 7 days), category, location and confirmed perks
- Explicit Hackathons category based on actual event name/content
- Detailed event views with proper admission and confirmation wording
- Registration redirects to official organiser pages; no checkout or fabricated tickets
- Saved events stored in browser localStorage
- Image-first cards, real public database thumbnail URLs and graceful fallback
- Keyboard labels, reduced-motion preference and mobile bottom navigation

## Integration into original production Next.js site

Do **not** deploy this standalone prototype over the production Next.js source. It is a reference implementation, not a drop-in replacement. Production has additional capabilities and secure Neon integrations that must be preserved. Integrate the markup, CSS and interactions into the original `D:\Orbit Bengaluru` source, test the real `/explore`, `/saved`, `/suggest` and `/events/[slug]` routes, run `npm run build`, deploy to a Vercel preview, and verify against production before promotion.

The retired `/admin` and `/api/admin` Vercel 404 routing rules must be preserved. Never unpublish or alter records in Neon as part of a visual redesign.

## Known limitations

- This ZIP is a working design preview, not the live production redesign.
- The externally hosted organiser thumbnails may require network access and rights review.
- The snapshot can become stale; production API must remain the authoritative data source.
- External registration dates/links are not freshly audited by this prototype.
