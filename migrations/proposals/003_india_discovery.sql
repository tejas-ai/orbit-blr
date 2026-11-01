-- PROPOSAL ONLY. Do not execute against production without explicit approval.
-- Additive, nullable metadata: no records updated, deleted, published or archived.
BEGIN;
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS event_format text CHECK (event_format IN ('in_person','online','hybrid')),
  ADD COLUMN IF NOT EXISTS event_type text CHECK (event_type IN ('events','hackathons')),
  ADD COLUMN IF NOT EXISTS price_status text CHECK (price_status IN ('free','paid','unknown')),
  ADD COLUMN IF NOT EXISTS fee_amount numeric(12,2) CHECK (fee_amount >= 0),
  ADD COLUMN IF NOT EXISTS fee_currency char(3),
  ADD COLUMN IF NOT EXISTS fee_is_from boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS fee_notes text,
  ADD COLUMN IF NOT EXISTS fee_source_url text,
  ADD COLUMN IF NOT EXISTS fee_verified_at timestamptz;
-- No automatic Bengaluru/free defaults and no prize-money-to-fee conversion.
CREATE INDEX IF NOT EXISTS idx_events_discovery_city_date
  ON events (lower(city), start_at) WHERE publication_status = 'published';
COMMIT;
