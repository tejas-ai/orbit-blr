-- ====================================================================
-- ORBIT BLR - Production PostgreSQL / Supabase Schema
-- Discover. Connect. Build. | Bengaluru, Karnataka, India
-- ====================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  organizer VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  venue VARCHAR(255) NOT NULL,
  venue_type VARCHAR(64),
  area VARCHAR(128) NOT NULL,
  address TEXT,
  landmark VARCHAR(255),
  metro_station VARCHAR(255),
  map_url TEXT,
  is_in_person BOOLEAN NOT NULL DEFAULT TRUE,
  is_free BOOLEAN NOT NULL DEFAULT TRUE,
  registration_url TEXT NOT NULL,
  registration_status VARCHAR(64) NOT NULL DEFAULT 'open',
  approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  goodies_status VARCHAR(64) NOT NULL DEFAULT 'unverified',
  goodies_details TEXT,
  certificate_status VARCHAR(64) NOT NULL DEFAULT 'unverified',
  certificate_format VARCHAR(64),
  certificate_requirements TEXT,
  food_status VARCHAR(64) NOT NULL DEFAULT 'unverified',
  food_details TEXT,
  source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_notes TEXT,
  last_verified_at TIMESTAMPTZ,
  publication_status VARCHAR(64) NOT NULL DEFAULT 'published',
  who_should_attend JSONB DEFAULT '[]'::jsonb,
  topics_covered JSONB DEFAULT '[]'::jsonb,
  prerequisites TEXT,
  agenda JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_pg_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_pg_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_pg_events_area ON events(area);
CREATE INDEX IF NOT EXISTS idx_pg_events_reg_status ON events(registration_status);
CREATE INDEX IF NOT EXISTS idx_pg_events_pub_status ON events(publication_status);
CREATE INDEX IF NOT EXISTS idx_pg_events_featured ON events(featured);

-- 2. Community Suggestions Table
CREATE TABLE IF NOT EXISTS suggestions (
  id VARCHAR(64) PRIMARY KEY,
  event_url TEXT NOT NULL,
  event_name VARCHAR(255),
  organizer VARCHAR(255),
  notes TEXT,
  submitter_email VARCHAR(255),
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  event_id VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  details TEXT NOT NULL,
  actor VARCHAR(128) NOT NULL DEFAULT 'system',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subscribers Table (Optional notifications)
CREATE TABLE IF NOT EXISTS subscribers (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  preferences VARCHAR(64) NOT NULL DEFAULT 'all',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
