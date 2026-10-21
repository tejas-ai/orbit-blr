# ORBIT BLR — Event & Hackathon Image Quality Policy

**Applies only to:** production `https://orbit-blr.vercel.app`, public `/api/events`, authorized Neon project `broad-tooth-55681211`.

**Owner request:** Audit image coverage for every published event/hackathon hourly; deeper daily audit. Detect absent, broken, irrelevant, wrong-year, bad-quality or invisible banner thumbnails; repair safely and independently verify visible publication. Do not touch retired Floot, retired `/admin` or `/api/admin*` paths, user data, or the ten protected pending-review seed records.

## Source hierarchy

1. Working, organizer-controlled, **event-specific official image**, with provenance.
2. Legitimate event-specific image provided by organizer or primary registration platform, independently matched to title and date.
3. **Original AI-generated ORBIT BLR illustration**, never misrepresented as organizer-created.
4. Existing local category SVG/PNG fallback if generation, hosting or publishing cannot be verified.

Do not replace verified working official artwork. Don't create fake portraits, organizer logos, sponsors, branded endorsements, winning prizes, gifts, certificates, venue scenes or other unsupported representations.

## Checks to run (hourly; full audit daily)

- Query published events and inspect `thumbnail_url`, `thumbnail_source_url`, `thumbnail_verification_status`, `thumbnail_alt`, `thumbnail_attribution`, `thumbnail_verified_at`.
- Verify current URL returns actual image bytes and image content-type (not a 200 HTML error page), supports browser rendering, has sensible aspect ratio/dimensions, and is relevant to the exact event, year and organizer. Redirects must end on suitable image content.
- Check actual rendered image in production homepage, Explore, Hackathons, and individual event detail views; inspect mobile layouts and image failures where available.
- If absent/invalid, search relevant event-specific organizer art first. Use fallback while searching; no broken-image icons.
- Only when official art is unavailable, generate a unique original **16:9 illustration** using verified title and generic category visual motifs (AI/ML, dev, cyber, hardware, hackathon, etc.). Use readable accessible text and optimize image size for mobile.
- Persist the image in stable approved public storage, with proper attribution; avoid temporary generated links and never place secret keys in code, GitHub or public DB. Version filename to prevent stale CDN caches.
- Explicitly record attribution `AI-generated ORBIT BLR illustration — not an official organizer poster` and sensible alt text. Do NOT claim official or organizer verification for AI artwork.
- **Compatibility gate:** The current `src/lib/thumbnails.ts` only selects `thumbnail_url` if `thumbnail_verification_status === 'verified'`. Modify that renderer safely to recognize a distinct `ai_generated` source and display a visible illustrative label **before** publishing any AI image; do not write `verified` for an AI-generated image.
- Before writing, inspect allowed Neon schema values and the TypeScript type. A schema change or frontend deployment needs separate explicit consent unless already authorized; never force an invalid enum/status or bypass restrictions.
- After an image repair, read back Neon data; GET the actual public image URL, GET `/api/events`, and view the *rendered* production card and detail poster. Say `live` only if all pass.
- Preserve source history, original asset URLs where available, verification notes and timestamps. Never modify event publication status merely for a missing image.
- If tooling/storage/image generation fails, keep the existing functional category fallback, queue for retry, and report only meaningful persistent errors.

## Scheduled workflow

- **Hourly:** Existing automation `ORBIT BLR — Events & Hackathons` monitors, detects and repairs eligible gaps.
- **Daily:** Existing automation `ORBIT BLR Daily Research & QA` double-checks all published event/hackathon visuals and unresolved issues.
- Do not send no-change alerts or duplicate notifications. Clearly report an actual repaired event and verified production URL when a visible change occurs.

## Publication integrity

No synthetic event facts, no private attendee details in public records, no attempts to revive the ten original discredited seeds, no admin dashboard re-creation, and no claims of successful upload or live display without readback and independent verification.
