import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function verifyDb() {
  console.log("Verifying Neon PostgreSQL state before production deployment...");

  const publishedRes = await pool.query(
    "SELECT id, slug, name, organizer, registration_url, publication_status FROM events WHERE publication_status = 'published' ORDER BY start_at ASC"
  );

  console.log(`\nPublished Events Count: ${publishedRes.rows.length}`);
  publishedRes.rows.forEach((r, idx) => {
    console.log(`[${idx + 1}] ID: ${r.id}`);
    console.log(`    Slug: ${r.slug}`);
    console.log(`    Name: ${r.name}`);
    console.log(`    URL:  ${r.registration_url}`);
  });

  const unpublishedRes = await pool.query(
    "SELECT id, name, publication_status FROM events WHERE publication_status != 'published' ORDER BY id ASC"
  );

  console.log(`\nUnpublished / Seed Records Count: ${unpublishedRes.rows.length}`);
  unpublishedRes.rows.forEach((r, idx) => {
    console.log(`[${idx + 1}] ID: ${r.id} | Status: ${r.publication_status} | Name: ${r.name}`);
  });

  await pool.end();
}

verifyDb().catch((err) => {
  console.error("DB verification failed:", err);
  process.exit(1);
});
