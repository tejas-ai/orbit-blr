-- ==============================================================================
-- ORBIT BLR 3.3 — EVENT INGESTION, HACKATHON SUPPORT & ARCHIVAL INDEXES
-- Migration: 002_event_ingestion_and_hackathons.sql
-- Neon Project: broad-tooth-55681211
--
-- Safely and additively adds:
-- 1. hackathon_details (JSONB) column for rich structured hackathon metadata.
-- 2. Performance indexes on registration_url and (publication_status, end_at)
--    to support lightning-fast deduplication and hourly archival queries.
--
-- This migration is 100% backward-compatible, non-destructive, and idempotent.
-- ==============================================================================

BEGIN;

-- 1. Preflight check: Ensure events table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    RAISE EXCEPTION 'Target table public.events does not exist.';
  END IF;
END $$;

-- 2. Add hackathon_details column if not already present
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS hackathon_details JSONB DEFAULT NULL;

-- 3. Add index on registration_url for O(1) deduplication lookup
CREATE INDEX IF NOT EXISTS idx_events_registration_url 
  ON public.events USING btree (registration_url);

-- 4. Add composite index on (publication_status, end_at) for hourly archival scans
CREATE INDEX IF NOT EXISTS idx_events_pub_status_end_at 
  ON public.events USING btree (publication_status, end_at);

-- 5. Track migration in schema_migrations table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'schema_migrations'
  ) THEN
    INSERT INTO public.schema_migrations (version, applied_at, description)
    VALUES (
      '002_event_ingestion_and_hackathons', 
      NOW(), 
      'Add hackathon_details jsonb column and performance indexes for deduplication and archival'
    )
    ON CONFLICT (version) DO NOTHING;
  END IF;
END $$;

COMMIT;
