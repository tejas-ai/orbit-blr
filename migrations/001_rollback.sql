-- ==============================================================================
-- ORBIT BLR 3.2 — Auth & User Accounts Safe Rollback Script
-- Target: Neon PostgreSQL (Database: broad-tooth-55681211)
-- Safety: 
--   Strictly protects against accidental post-launch user data destruction.
--
-- POST-LAUNCH POLICY:
-- Once real user accounts exist in production, DO NOT DROP TABLES.
-- Use application-only rollback (redeploying git commit 998f5cb on Vercel)
-- to revert the frontend while preserving user accounts and saved events.
-- ==============================================================================

DO $$
BEGIN
    -- Check if users table exists and contains real user data
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        IF (SELECT COUNT(*) FROM users) > 0 THEN
            RAISE EXCEPTION 
                'SAFETY ABORT: The users table contains registered user accounts (% rows). '
                'Executing this destructive rollback script will cause IRREVERSIBLE USER DATA LOSS. '
                'For production incidents, perform an APPLICATION-ONLY ROLLBACK by redeploying '
                'commit 998f5cb on Vercel, which preserves all user accounts and saved events.',
                (SELECT COUNT(*) FROM users);
        END IF;
    END IF;
END $$;

BEGIN;

-- Safe to drop ONLY during pre-launch staging when 0 users exist
DROP TABLE IF EXISTS user_saved_events CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Remove migration tracking record
DELETE FROM schema_migrations WHERE version = '001_auth_tables';

COMMIT;
