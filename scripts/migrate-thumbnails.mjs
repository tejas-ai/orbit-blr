import pg from "pg";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf-8");
const match = env.match(/DATABASE_URL=(.*)/);
if (!match) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: match[1].trim().replace(/^["']|["']$/g, ""),
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log("🛠️ Applying backward-compatible thumbnail schema migrations to Neon PostgreSQL...");

  await pool.query(`
    ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_source_url TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_alt TEXT;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_verification_status VARCHAR(50) DEFAULT 'unverified';
    ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_verified_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE events ADD COLUMN IF NOT EXISTS thumbnail_attribution TEXT;
  `);

  console.log("✅ Columns added or verified.");

  // Verified thumbnail mappings for published events
  const verifiedThumbnails = [
    {
      id: "evt-blrdroid-blrkotlin-20261024",
      url: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=85,width=1200,height=630/event-social/ai/7c42073d-5453-43c2-926e-fb74b02a6a19.png",
      source: "https://luma.com/1dfd73wq",
      alt: "BlrDroid + BlrKotlin October Meetup Banner",
      attribution: "BlrDroid & BlrKotlin Community Official Luma Asset",
    },
    {
      id: "evt-owasp-null-20261024",
      url: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=85,width=1200,height=630/event-social/2c/b1684be2-8b75-4a2f-b480-a019b8910ae0.png",
      source: "https://luma.com/wlstrxqv",
      alt: "OWASP Bangalore / Null Bangalore Monthly Meetup Banner",
      attribution: "OWASP Bangalore Chapter Official Luma Asset",
    },
    {
      id: "evt-software-architects-20261024",
      url: "https://secure.meetupstatic.com/photos/event/e/6/3/2/600_526438930.jpeg",
      source: "https://www.meetup.com/softwarearchitectsbangalore/events/316719692/",
      alt: "Software Architects Bangalore In-Person Meetup Photo",
      attribution: "Software Architects Bangalore Official Meetup Photo",
    },
    {
      id: "evt-bangpypers-fp-20261024",
      url: "https://secure.meetupstatic.com/photos/event/8/6/5/f/600_536374399.jpeg",
      source: "https://www.meetup.com/bangpypers/events/312819339/",
      alt: "BangPypers Python Meetup X Functional Programming India Banner",
      attribution: "BangPypers Official Meetup Community Photo",
    },
    {
      id: "evt-world-models-20261031",
      url: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=85,width=1200,height=630/event-social/62/a0229644-ea5b-4915-92e8-77599ba89156.png",
      source: "https://luma.com/lwzwhpz5",
      alt: "Beyond LLMs: A Glimpse of World Models & Physical AI Banner",
      attribution: "Tech Coach Circle Official Luma Asset",
    },
  ];

  console.log("📸 Updating verified published events with official authentic thumbnails...");
  const now = new Date().toISOString();

  for (const item of verifiedThumbnails) {
    await pool.query(
      `
      UPDATE events
      SET 
        thumbnail_url = $1,
        thumbnail_source_url = $2,
        thumbnail_alt = $3,
        thumbnail_verification_status = 'verified',
        thumbnail_verified_at = $4,
        thumbnail_attribution = $5,
        updated_at = $4
      WHERE id = $6;
    `,
      [item.url, item.source, item.alt, now, item.attribution, item.id]
    );
    console.log(`  ✓ Updated ${item.id}`);
  }

  // Check results
  const res = await pool.query(`
    SELECT id, name, thumbnail_url, thumbnail_verification_status
    FROM events
    WHERE publication_status = 'published'
    ORDER BY start_at ASC;
  `);

  console.log("\n🔍 Verification results for published events:");
  for (const row of res.rows) {
    console.log(`- [${row.thumbnail_verification_status || "fallback"}] ${row.name}`);
    console.log(`  Thumbnail: ${row.thumbnail_url || "(Will use category artwork fallback)"}`);
  }

  await pool.end();
  console.log("\n🎉 Database thumbnail migration complete!");
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
