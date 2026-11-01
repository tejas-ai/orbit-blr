import pg from 'pg';
import fs from 'node:fs';
const env=fs.readFileSync('.env.local','utf8');
const connectionString=env.match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^["']|["']$/g,'');
const pool=new pg.Pool({connectionString,ssl:{rejectUnauthorized:false}});
const client=await pool.connect();
try {
  await client.query('BEGIN READ ONLY');
  const counts=await client.query('SELECT publication_status, count(*)::int AS count FROM events GROUP BY publication_status ORDER BY publication_status');
  const seedIds=[...fs.readFileSync('src/lib/seed-data.ts','utf8').matchAll(/id: "([^"]+)"/g)].map(m=>m[1]);
  const seeds=await client.query('SELECT id, publication_status FROM events WHERE id = ANY($1) ORDER BY id',[seedIds]);
  const ids=await client.query('SELECT id FROM events ORDER BY id');
  const expired=await client.query("SELECT count(*)::int AS count FROM events WHERE publication_status='published' AND end_at<=NOW()");
  const output={checkedAt:new Date().toISOString(),counts:counts.rows,seeds:seeds.rows,ids:ids.rows.map(r=>r.id),expiredPublished:expired.rows[0].count};
  if(seeds.rows.length!==10 || seeds.rows.some(r=>r.publication_status!=='pending_review')) throw new Error('Seed quarantine mismatch');
  const path='qa-results/india-discovery/db-audit.json';
  fs.mkdirSync('qa-results/india-discovery',{recursive:true});
  if(fs.existsSync(path)) {
    const before=JSON.parse(fs.readFileSync(path,'utf8'));
    const missing=before.ids.filter(id=>!output.ids.includes(id));
    if(missing.length) throw new Error(`Missing ${missing.length} previously observed event IDs`);
    output.previousIdsPreserved=true;
  }
  fs.writeFileSync(path,JSON.stringify(output,null,2));
  console.log(JSON.stringify({counts:output.counts,quarantinedSeeds:seeds.rows.length,expiredPublished:output.expiredPublished,previousIdsPreserved:output.previousIdsPreserved},null,2));
} finally {await client.query('ROLLBACK');client.release();await pool.end();}
