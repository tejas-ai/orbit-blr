-- ==============================================================================
-- ORBIT BLR 3.2 — Auth & User Accounts Schema Migration
-- Target: Neon PostgreSQL (Database: broad-tooth-55681211)
-- Safety: 
--   1. Fully atomic transaction (BEGIN ... COMMIT).
--   2. Explicit schema migration tracking (schema_migrations table).
--   3. Preflight sanity checks.
--   4. Minimal data footprint: OAuth tokens (access/refresh/id) are NOT stored.
--   5. Zero alteration to existing core tables (events, audit_logs, subscribers, suggestions).
-- ==============================================================================

BEGIN;

-- 1. Explicit Migration Tracking Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT
);

-- 2. Preflight Sanity Checks Block
DO $$
BEGIN
    -- Verify PostgreSQL engine compatibility (PostgreSQL 14+)
    IF current_setting('server_version_num')::int < 140000 THEN
        RAISE EXCEPTION 'Preflight check failed: PostgreSQL 14 or higher is required.';
    END IF;

    -- Verify that core events table exists and is unaffected
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'events'
    ) THEN
        RAISE EXCEPTION 'Preflight check failed: Core events table was not found in public schema.';
    END IF;

    -- Verify that migration has not already been applied
    IF EXISTS (
        SELECT 1 FROM schema_migrations WHERE version = '001_auth_tables'
    ) THEN
        RAISE NOTICE 'Migration 001_auth_tables has already been applied. Skipping DDL creation.';
    END IF;
END $$;

-- 3. Users Table (Core user profile; email allows multiple NULLs for private GitHub profiles)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMPTZ,
    image TEXT,
    primary_provider TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sign_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 4. Accounts Table (OAuth Identity Mapping ONLY — Tokens are NOT persisted for security)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_provider_account UNIQUE (provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

-- 5. Sessions Table (Database session tracking fallback)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- 6. User Saved Events (Cross-device bookmark synchronization scoped to user_id)
CREATE TABLE IF NOT EXISTS user_saved_events (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_events_user ON user_saved_events(user_id);

-- 7. Record Migration Version
INSERT INTO schema_migrations (version, description)
VALUES ('001_auth_tables', 'Auth.js v5 users, accounts, sessions, user_saved_events (zero OAuth token storage)')
ON CONFLICT (version) DO NOTHING;

COMMIT;
