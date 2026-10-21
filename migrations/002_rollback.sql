-- ==============================================================================
-- ORBIT BLR 3.3 — ROLLBACK SCRIPT FOR MIGRATION 002
-- Migration: 002_rollback.sql
--
-- Safely drops added indexes and the hackathon_details column.
-- Preserves all other tables, users, and event rows.
-- ==============================================================================

BEGIN;

-- 1. Drop composite archival index
DROP INDEX IF EXISTS public.idx_events_pub_status_end_at;

-- 2. Drop registration URL index
DROP INDEX IF EXISTS public.idx_events_registration_url;

-- 3. Drop hackathon_details column
ALTER TABLE public.events 
  DROP COLUMN IF EXISTS hackathon_details;

-- 4. Remove tracking record
DELETE FROM public.schema_migrations 
WHERE version = '002_event_ingestion_and_hackathons';

COMMIT;
