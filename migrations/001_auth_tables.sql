-- ==============================================================================
-- ORBIT BLR 3.2 — Auth & User Accounts Schema Migration
-- Target: Neon PostgreSQL (Database: broad-tooth-55681211)
-- Safety: 
--   1. Fully atomic transaction (BEGIN ... COMMIT).
--   2. Explicit schema migration tracking (schema_migrations table).
--   3. Preflight sanity checks and engine validation.
--   4. Deterministic rerun handling with schema compatibility validation.
--   5. Minimal data footprint: OAuth tokens (access/refresh/id) are NOT stored.
--   6. Zero alteration to existing core tables (events, audit_logs, subscribers, suggestions).
-- ==============================================================================

BEGIN;

-- 1. Ensure schema_migrations table exists for version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT
);

-- 2. Migration Execution & Schema Compatibility Controller Block
DO $migration$
DECLARE
    v_applied BOOLEAN := FALSE;
    v_deprecated_tokens INT := 0;
BEGIN
    -- Check if migration 001_auth_tables is recorded as applied
    SELECT EXISTS (
        SELECT 1 FROM schema_migrations WHERE version = '001_auth_tables'
    ) INTO v_applied;

    IF v_applied THEN
        -- Rerun Handling: Validate existing schema compatibility
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA AND table_name = 'users') OR
           NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA AND table_name = 'accounts') OR
           NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA AND table_name = 'sessions') OR
           NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = CURRENT_SCHEMA AND table_name = 'user_saved_events') THEN
            RAISE EXCEPTION 'Schema integrity error: Migration 001_auth_tables is recorded as applied, but one or more required auth tables are missing.';
        END IF;

        -- Verify accounts table does NOT have deprecated OAuth token columns (data minimization verification)
        SELECT COUNT(*) INTO v_deprecated_tokens
        FROM information_schema.columns
        WHERE table_schema = CURRENT_SCHEMA 
          AND table_name = 'accounts' 
          AND column_name IN ('access_token', 'refresh_token', 'id_token');

        IF v_deprecated_tokens > 0 THEN
            RAISE EXCEPTION 'Schema incompatibility error: accounts table contains deprecated OAuth token storage columns.';
        END IF;

        RAISE NOTICE 'Migration 001_auth_tables is already applied and schema compatibility is verified. Skipping DDL creation.';
        RETURN;
    END IF;

    -- Fresh Migration Preflight Checks
    -- Verify PostgreSQL engine compatibility (PostgreSQL 14+)
    IF current_setting('server_version_num')::int < 140000 THEN
        RAISE EXCEPTION 'Preflight check failed: PostgreSQL 14 or higher is required.';
    END IF;

    -- Verify that core events table exists and is unaffected
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = CURRENT_SCHEMA AND table_name = 'events'
    ) THEN
        RAISE EXCEPTION 'Preflight check failed: Core events table was not found in active schema.';
    END IF;

    -- Fresh DDL Application
    EXECUTE $ddl$
        -- Core Users Table (email allows multiple NULLs for private GitHub profiles)
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

        -- Accounts Table (OAuth Identity Mapping ONLY — Zero token storage)
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

        -- Sessions Table (Database session fallback)
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            session_token TEXT UNIQUE NOT NULL,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

        -- User Saved Events (Cross-device bookmark synchronization scoped to user_id)
        CREATE TABLE IF NOT EXISTS user_saved_events (
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            event_id TEXT NOT NULL,
            saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, event_id)
        );
        CREATE INDEX IF NOT EXISTS idx_user_saved_events_user ON user_saved_events(user_id);
    $ddl$;

    -- Record Migration Version
    INSERT INTO schema_migrations (version, description)
    VALUES ('001_auth_tables', 'Auth.js v5 users, accounts, sessions, user_saved_events (zero OAuth token storage)')
    ON CONFLICT (version) DO NOTHING;

    RAISE NOTICE 'Migration 001_auth_tables applied successfully.';
END $migration$;

COMMIT;
