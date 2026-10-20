-- ==============================================================================
-- ORBIT BLR 3.2 — Auth & User Accounts Safe Rollback Script
-- Target: Neon PostgreSQL (Database: broad-tooth-55681211)
-- Safety: 
--   1. Executes strictly inside an atomic transaction (BEGIN ... COMMIT).
--   2. Acquires ACCESS EXCLUSIVE lock to prevent concurrent user inserts (eliminating check-then-drop race conditions).
--   3. Automatically aborts if any real registered user accounts exist.
--
-- POST-LAUNCH POLICY:
-- Once real user accounts exist in production, DO NOT DROP TABLES.
-- Use application-only rollback (redeploying git commit 998f5cb on Vercel)
-- to revert the frontend while preserving user accounts and saved events.
-- ==============================================================================

BEGIN;

-- Safety Evaluation Block with Table-Level Locking
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = CURRENT_SCHEMA AND table_name = 'users'
    ) THEN
        -- Acquire ACCESS EXCLUSIVE lock on users table to serialize execution
        -- and eliminate any check-then-drop race condition
        LOCK TABLE users IN ACCESS EXCLUSIVE MODE;

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

-- Safe to drop ONLY during pre-launch testing when 0 user rows exist
DROP TABLE IF EXISTS user_saved_events CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Remove migration tracking record if schema_migrations exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = CURRENT_SCHEMA AND table_name = 'schema_migrations'
    ) THEN
        DELETE FROM schema_migrations WHERE version = '001_auth_tables';
    END IF;
END $$;

COMMIT;
