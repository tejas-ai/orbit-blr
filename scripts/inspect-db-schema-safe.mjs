import pg from 'pg';
import fs from 'node:fs';

const env = fs.readFileSync('.env.local', 'utf8');
const dbUrl = env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g, '');

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function inspect() {
  const client = await pool.connect();
  try {
    // 1. Tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables:', tables.rows.map(r => r.table_name));

    // 2. Events counts by publication_status
    const statusCounts = await client.query(`
      SELECT publication_status, COUNT(*) as count 
      FROM events 
      GROUP BY publication_status;
    `);
    console.log('Events by publication_status:', statusCounts.rows);

    // 3. Past vs future events count for published
    const timing = await client.query(`
      SELECT 
        COUNT(*) FILTER (WHERE end_at < NOW()) as expired_count,
        COUNT(*) FILTER (WHERE end_at >= NOW()) as active_count,
        COUNT(*) as total_published
      FROM events 
      WHERE publication_status = 'published';
    `);
    console.log('Timing for published events:', timing.rows[0]);

    // 4. Columns in events table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position;
    `);
    console.log('Event columns:', columns.rows.map(c => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));

    // 5. Constraints on events table
    const constraints = await client.query(`
      SELECT conname, contype, pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conrelid = 'public.events'::regclass;
    `);
    console.log('Constraints:', constraints.rows);

    // 5b. Indexes on events table
    const indexes = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'events';
    `);
    console.log('Indexes on events:', indexes.rows);

    // 6. Check categories present in database
    const categories = await client.query(`
      SELECT category, COUNT(*) as count
      FROM events
      GROUP BY category
      ORDER BY count DESC;
    `);
    console.log('Categories in DB:', categories.rows);

  } finally {
    client.release();
    await pool.end();
  }
}
inspect().catch(console.error);
