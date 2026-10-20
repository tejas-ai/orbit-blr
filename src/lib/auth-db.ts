import pg from "pg";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const { Pool } = pg;

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  primary_provider: string;
  created_at: string;
  last_sign_in_at: string;
}

export interface UserStats {
  totalUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  providerBreakdown: {
    google: number;
    github: number;
    other: number;
  };
  recentActive24h: number;
}

const globalForAuthDb = globalThis as unknown as {
  orbitPgPool?: pg.Pool;
  orbitSqliteDb?: DatabaseSync;
};

function getPgPool(): pg.Pool | null {
  const connString = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
  if (!connString) return null;

  if (!globalForAuthDb.orbitPgPool) {
    globalForAuthDb.orbitPgPool = new Pool({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return globalForAuthDb.orbitPgPool;
}

function getSqliteDb(): DatabaseSync {
  if (globalForAuthDb.orbitSqliteDb) {
    return globalForAuthDb.orbitSqliteDb;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "orbit.db");
  const db = new DatabaseSync(dbPath);

  // Initialize SQLite Auth Schema if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      email_verified TEXT,
      image TEXT,
      primary_provider TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_sign_in_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(provider, provider_account_id)
    );

    CREATE TABLE IF NOT EXISTS user_saved_events (
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      saved_at TEXT NOT NULL,
      PRIMARY KEY (user_id, event_id)
    );
  `);

  globalForAuthDb.orbitSqliteDb = db;
  return db;
}

/**
 * Upsert user on successful OAuth login
 */
export async function upsertOAuthUser(params: {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider: string;
  providerAccountId: string;
}): Promise<UserProfile> {
  const now = new Date().toISOString();
  const pool = getPgPool();

  if (pool) {
    try {
      // 1. Check if account already exists
      const accRes = await pool.query(
        "SELECT user_id FROM accounts WHERE provider = $1 AND provider_account_id = $2",
        [params.provider, params.providerAccountId]
      );

      let userId = accRes.rows[0]?.user_id;

      if (!userId && params.email) {
        // Find existing user with matching email
        const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [params.email]);
        userId = userRes.rows[0]?.id;
      }

      if (userId) {
        // Update user profile and last sign-in
        const updateRes = await pool.query(
          `UPDATE users SET
             name = COALESCE($1, name),
             image = COALESCE($2, image),
             last_sign_in_at = $3
           WHERE id = $4
           RETURNING *`,
          [params.name, params.image, now, userId]
        );

        // Ensure account link exists
        await pool.query(
          `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, created_at)
           VALUES ($1, $2, 'oauth', $3, $4, $5)
           ON CONFLICT (provider, provider_account_id) DO NOTHING`,
          [`acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, params.provider, params.providerAccountId, now]
        );

        return updateRes.rows[0];
      }

      // New user
      const newUserId = params.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const insertUser = await pool.query(
        `INSERT INTO users (id, name, email, image, primary_provider, created_at, last_sign_in_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [newUserId, params.name || null, params.email || null, params.image || null, params.provider, now, now]
      );

      await pool.query(
        `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, created_at)
         VALUES ($1, $2, 'oauth', $3, $4, $5)`,
        [`acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, newUserId, params.provider, params.providerAccountId, now]
      );

      return insertUser.rows[0];
    } catch (err) {
      console.warn("PostgreSQL upsertOAuthUser warning:", err instanceof Error ? err.message : err);
    }
  }

  // SQLite fallback
  const db = getSqliteDb();
  const acc = db.prepare("SELECT user_id FROM accounts WHERE provider = ? AND provider_account_id = ?").get(params.provider, params.providerAccountId) as { user_id: string } | undefined;
  let userId = acc?.user_id;

  if (!userId && params.email) {
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(params.email) as { id: string } | undefined;
    userId = existing?.id;
  }

  if (userId) {
    db.prepare("UPDATE users SET name = COALESCE(?, name), image = COALESCE(?, image), last_sign_in_at = ? WHERE id = ?").run(params.name || null, params.image || null, now, userId);
    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as unknown as UserProfile;
  }

  const newUserId = params.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  db.prepare("INSERT INTO users (id, name, email, image, primary_provider, created_at, last_sign_in_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(newUserId, params.name || null, params.email || null, params.image || null, params.provider, now, now);
  db.prepare("INSERT INTO accounts (id, user_id, type, provider, provider_account_id, created_at) VALUES (?, ?, 'oauth', ?, ?, ?)").run(`acc-${Date.now()}`, newUserId, params.provider, params.providerAccountId, now);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(newUserId) as unknown as UserProfile;
}

/**
 * Get Saved Events for a user
 */
export async function getUserSavedEvents(userId: string): Promise<string[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query(
        "SELECT event_id FROM user_saved_events WHERE user_id = $1 ORDER BY saved_at DESC",
        [userId]
      );
      return res.rows.map((r) => r.event_id);
    } catch (err) {
      console.warn("PostgreSQL getUserSavedEvents warning:", err instanceof Error ? err.message : err);
    }
  }

  try {
    const db = getSqliteDb();
    const rows = db.prepare("SELECT event_id FROM user_saved_events WHERE user_id = ? ORDER BY saved_at DESC").all(userId) as { event_id: string }[];
    return rows.map((r) => r.event_id);
  } catch {
    return [];
  }
}

/**
 * Merge local bookmarks with account bookmarks non-destructively
 */
export async function mergeUserSavedEvents(userId: string, localIds: string[]): Promise<string[]> {
  const serverIds = await getUserSavedEvents(userId);
  const combined = Array.from(new Set([...serverIds, ...localIds]));
  const now = new Date().toISOString();

  const pool = getPgPool();
  if (pool) {
    try {
      for (const id of combined) {
        await pool.query(
          "INSERT INTO user_saved_events (user_id, event_id, saved_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [userId, id, now]
        );
      }
      return combined;
    } catch (err) {
      console.warn("PostgreSQL mergeUserSavedEvents warning:", err instanceof Error ? err.message : err);
    }
  }

  try {
    const db = getSqliteDb();
    const insert = db.prepare("INSERT OR IGNORE INTO user_saved_events (user_id, event_id, saved_at) VALUES (?, ?, ?)");
    for (const id of combined) {
      insert.run(userId, id, now);
    }
  } catch {
    // fallback
  }

  return combined;
}

/**
 * Toggle a saved event in account
 */
export async function toggleUserSavedEvent(userId: string, eventId: string): Promise<{ saved: boolean; ids: string[] }> {
  const pool = getPgPool();
  const now = new Date().toISOString();

  if (pool) {
    try {
      const check = await pool.query(
        "SELECT event_id FROM user_saved_events WHERE user_id = $1 AND event_id = $2",
        [userId, eventId]
      );

      if (check.rows.length > 0) {
        await pool.query(
          "DELETE FROM user_saved_events WHERE user_id = $1 AND event_id = $2",
          [userId, eventId]
        );
        const updated = await getUserSavedEvents(userId);
        return { saved: false, ids: updated };
      } else {
        await pool.query(
          "INSERT INTO user_saved_events (user_id, event_id, saved_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
          [userId, eventId, now]
        );
        const updated = await getUserSavedEvents(userId);
        return { saved: true, ids: updated };
      }
    } catch (err) {
      console.warn("PostgreSQL toggleUserSavedEvent warning:", err instanceof Error ? err.message : err);
    }
  }

  // SQLite fallback
  const db = getSqliteDb();
  const existing = db.prepare("SELECT event_id FROM user_saved_events WHERE user_id = ? AND event_id = ?").get(userId, eventId);
  if (existing) {
    db.prepare("DELETE FROM user_saved_events WHERE user_id = ? AND event_id = ?").run(userId, eventId);
    return { saved: false, ids: await getUserSavedEvents(userId) };
  } else {
    db.prepare("INSERT OR IGNORE INTO user_saved_events (user_id, event_id, saved_at) VALUES (?, ?, ?)").run(userId, eventId, now);
    return { saved: true, ids: await getUserSavedEvents(userId) };
  }
}

/**
 * Aggregate Account Statistics (Protected, Server-Side Authorized)
 */
export async function getRegisteredUserStats(): Promise<UserStats> {
  const pool = getPgPool();
  if (pool) {
    try {
      const totalRes = await pool.query("SELECT COUNT(*)::int as count FROM users");
      const weekRes = await pool.query("SELECT COUNT(*)::int as count FROM users WHERE created_at >= NOW() - INTERVAL '7 days'");
      const monthRes = await pool.query("SELECT COUNT(*)::int as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'");
      const active24hRes = await pool.query("SELECT COUNT(*)::int as count FROM users WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours'");
      const providersRes = await pool.query(`
        SELECT primary_provider, COUNT(*)::int as count
        FROM users
        GROUP BY primary_provider
      `);

      const breakdown = { google: 0, github: 0, other: 0 };
      for (const row of providersRes.rows) {
        if (row.primary_provider === "google") breakdown.google = row.count;
        else if (row.primary_provider === "github") breakdown.github = row.count;
        else breakdown.other += row.count;
      }

      return {
        totalUsers: totalRes.rows[0]?.count || 0,
        newThisWeek: weekRes.rows[0]?.count || 0,
        newThisMonth: monthRes.rows[0]?.count || 0,
        providerBreakdown: breakdown,
        recentActive24h: active24hRes.rows[0]?.count || 0,
      };
    } catch (err) {
      console.warn("PostgreSQL getRegisteredUserStats warning:", err instanceof Error ? err.message : err);
    }
  }

  // SQLite fallback
  try {
    const db = getSqliteDb();
    const total = (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number })?.count || 0;
    const google = (db.prepare("SELECT COUNT(*) as count FROM users WHERE primary_provider = 'google'").get() as { count: number })?.count || 0;
    const github = (db.prepare("SELECT COUNT(*) as count FROM users WHERE primary_provider = 'github'").get() as { count: number })?.count || 0;

    return {
      totalUsers: total,
      newThisWeek: total,
      newThisMonth: total,
      providerBreakdown: { google, github, other: Math.max(0, total - google - github) },
      recentActive24h: total,
    };
  } catch {
    return {
      totalUsers: 0,
      newThisWeek: 0,
      newThisMonth: 0,
      providerBreakdown: { google: 0, github: 0, other: 0 },
      recentActive24h: 0,
    };
  }
}
