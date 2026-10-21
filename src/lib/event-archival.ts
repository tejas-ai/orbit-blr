import pg from "pg";
import { logAudit } from "./db.ts";

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;

function getPgPool(): pg.Pool {
  if (!poolInstance) {
    const connString = process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, "");
    if (!connString) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }
    poolInstance = new Pool({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return poolInstance;
}

export interface ArchivalReport {
  timestamp: string;
  archivedCount: number;
  archivedEvents: Array<{
    id: string;
    slug: string;
    name: string;
    end_at: string;
  }>;
  activePublishedCount: number;
  totalEventsInDb: number;
}

/**
 * Automatically archives completed events whose scheduled final end_at has passed.
 * Phase Six: Automatic Expired-Event Archival.
 * Uses PostgreSQL's server-side NOW() timestamp for authoritative time comparison.
 */
export async function archiveExpiredEvents(actor = "hourly-archival-cron"): Promise<ArchivalReport> {
  const pool = getPgPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Identify all published events where scheduled end_at is in the past
    // Uses PostgreSQL NOW() directly against stored timestamptz
    const expiredQuery = `
      SELECT id, slug, name, end_at, publication_status 
      FROM events 
      WHERE publication_status = 'published' 
        AND end_at < NOW() 
      ORDER BY end_at ASC
      FOR UPDATE;
    `;

    const expiredRes = await client.query(expiredQuery);
    const expiredRows = expiredRes.rows;

    const archivedList: Array<{ id: string; slug: string; name: string; end_at: string }> = [];

    // 2. Safely transition each expired event to 'archived'
    if (expiredRows.length > 0) {
      const updateQuery = `
        UPDATE events 
        SET 
          publication_status = 'archived',
          updated_at = NOW(),
          verification_notes = COALESCE(verification_notes, '') || E'\n[Auto-Archived] Event scheduled end_at has passed on ' || NOW()::text
        WHERE id = $1 AND publication_status = 'published';
      `;

      for (const row of expiredRows) {
        await client.query(updateQuery, [row.id]);
        archivedList.push({
          id: row.id,
          slug: row.slug,
          name: row.name,
          end_at: new Date(row.end_at).toISOString(),
        });

        // Audit log entry
        try {
          await logAudit(
            row.id,
            "status_change",
            `Event auto-archived: scheduled end_at (${new Date(row.end_at).toISOString()}) has elapsed.`,
            actor
          );
        } catch {}
      }
    }

    await client.query("COMMIT");

    // 3. Independent Readback of current counts
    const activeRes = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE publication_status = 'published') as active_count,
        COUNT(*) as total_count
      FROM events;
    `);

    const activePublishedCount = parseInt(activeRes.rows[0].active_count || "0", 10);
    const totalEventsInDb = parseInt(activeRes.rows[0].total_count || "0", 10);

    return {
      timestamp: new Date().toISOString(),
      archivedCount: archivedList.length,
      archivedEvents: archivedList,
      activePublishedCount,
      totalEventsInDb,
    };
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
