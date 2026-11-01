# Review proposals — NOT executed

## Schema proposal

See `migrations/proposals/003_india_discovery.sql`. Current schema was inspected read-only on Neon project `broad-tooth-55681211`, production branch `br-twilight-math-b5atwe9l` through the existing connection. The app remains compatible with the existing schema: it reads optional columns only when present, and public queries use existing columns. Timestamps, registration, sources and hackathon JSON already exist.

New fields: city/state, explicit online/in-person/hybrid format, authoritative event type, free/paid/unknown classification, numeric participation/ticket fee, ISO currency, starting-price flag, fee conditions and fee source/verification timestamp. Source-backed amounts are displayed only when provenance exists; prizes never supply fee amounts. An explicit unknown classification overrides the legacy boolean. Legacy `is_free` is shown only for records with verification timestamps. New columns are nullable to avoid inventing facts for old rows.

Approve and test in an isolated Neon branch first. Record a full event ID/status checksum and migration baseline. Compare all IDs, the ten discredited seed IDs, pending-review and archived states after migration. No bulk publication, deletion, status change, or inferred location/fee backfill. Apply reviewed metadata per event only after fresh organiser evidence. Do not run the SQL automatically at app startup/build/deploy.

Rollback: deploy the previous app revision and leave these additive nullable columns intact. Dropping populated columns would lose newly collected facts and needs a separate review. The small current public catalogue is filtered in memory after PostgreSQL uses the existing publication/end-time index. At catalogue scale, use a reviewed parameterized SQL query on the new canonical columns, add pagination in a versioned API, and measure with EXPLAIN before adding further indexes. Do not silently truncate the existing API.

## Proposed maintenance instructions — approval required

No automation or ingestion publication policy was changed by this redesign. Existing ingestion rejects paid/outside-Bengaluru events; that gate must be separately updated and tested after these proposals are approved. The frontend/API support the new discovery model, but this is not a claim that the production catalogue already covers India.

Replace the former free/in-person/Bengaluru-only research scope with free AND paid tech events and hackathons across India, including online/hybrid, university competitions, workshops, bootcamps, conferences and startup events. Research Hack2skill, GDG/Google Cloud, Reskilll, Unstop, Devfolio, Luma, Meetup, KonfHub, Eventbrite, DoraHacks, AWS/Microsoft/NVIDIA communities, FOSS United, OWASP/null, IEEE/ACM and official university/organiser sites.

For each candidate, independently cross-check event-specific official evidence: edition/year, IST start/end, actual city/state and physical venue, online/hybrid rounds, organiser, eligibility/team restrictions, application deadline/status, official registration destination, every mandatory round fee/deposit/tax and refund condition. Free registration alone is not free participation. Separate prize pools from entry fees. Record price scope (person/team, pass restrictions, starting price), currency, source URL and checked timestamp. Treat unknown fees as unknown. No fabricated posters; use verified event-specific organiser imagery with attribution or a clearly labelled category illustration. Never guarantee conditional benefits.

Exclude expired/cancelled/unsupported listings from upcoming results. Preserve all records and audit history. Keep the original ten discredited seed records pending_review unless independently reverified with fresh organiser-controlled evidence. Check the retired `/admin` and `/api/admin*` 404 safeguards. Do not touch Floot. Do not purchase services. Notify only for meaningful findings, failures or required user actions; retain the existing notification cadence otherwise.

## Approval-gated rollout

1. Review the preview and PR. Approve the frontend release separately from schema/research changes.
2. After frontend approval, merge the reviewed commit to `main` (the production branch), let Vercel build, verify the resulting production deployment status and alias, and smoke-test `/`, a real detail page, saved events, all filter combinations and retired routes.
3. Only after migration approval: create an isolated Neon test branch, run the proposed SQL there, compare record/status checksums, test the ingestion adapter and fee validation, then run the reviewed SQL against production during an agreed window. No schema execution has occurred in this task.
4. Review and approve the revised ingestion validation and saved automation instructions before enabling India-wide/paid publishing. Reverify representative records rather than mass-changing legacy booleans.
5. If regression occurs, restore the previous Vercel deployment. Do not reset/delete database records or drop metadata columns.
