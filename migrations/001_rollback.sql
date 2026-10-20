-- ==============================================================================
-- ORBIT BLR 3.2 — Auth & User Accounts Rollback Script
-- Target: Neon PostgreSQL (Database: broad-tooth-55681211)
-- Safety: Reverts 001_auth_tables.sql cleanly without touching events.
-- ==============================================================================

DROP TABLE IF EXISTS user_saved_events CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
