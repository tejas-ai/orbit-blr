import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

// Load DATABASE_URL from .env.local
const envPath = path.join(process.cwd(), ".env.local");
let dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl && fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^DATABASE_URL=(.*)$/);
    if (match) dbUrl = match[1].trim().replace(/^["']|["']$/g, "");
  }
}

if (!dbUrl) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function runNeonSandboxVerification() {
  console.log("================================================================================");
  console.log("NEON ISOLATED SANDBOX MIGRATION & SAFETY VERIFICATION SUITE");
  console.log("================================================================================\n");

  const client = await pool.connect();
  const sandboxSchema = "sandbox_migration_test";

  try {
    // 0. Initial baseline check on public schema
    const baselineTables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name ASC"
    );
    console.log("1. Public schema baseline tables:", baselineTables.rows.map(r => r.table_name));
    assert.deepStrictEqual(
      baselineTables.rows.map(r => r.table_name),
      ["audit_logs", "events", "subscribers", "suggestions"],
      "Public schema must contain ONLY the 4 original tables before test"
    );

    // 1. Create isolated sandbox schema
    console.log(`\n2. Creating isolated sandbox schema: ${sandboxSchema}...`);
    await client.query(`DROP SCHEMA IF EXISTS ${sandboxSchema} CASCADE;`);
    await client.query(`CREATE SCHEMA ${sandboxSchema};`);

    // Create events table clone inside sandbox to satisfy preflight check
    await client.query(`
      CREATE TABLE ${sandboxSchema}.events (
        id TEXT PRIMARY KEY,
        name TEXT,
        publication_status TEXT NOT NULL DEFAULT 'published'
      );
    `);

    // Set search_path strictly to sandboxSchema
    await client.query(`SET search_path TO ${sandboxSchema};`);
    console.log(`   search_path switched to: ${sandboxSchema}`);

    // Read SQL migration scripts
    const migrationSql = fs.readFileSync(path.join(process.cwd(), "migrations", "001_auth_tables.sql"), "utf-8");
    const rollbackSql = fs.readFileSync(path.join(process.cwd(), "migrations", "001_rollback.sql"), "utf-8");

    // 2. Execute fresh migration
    console.log("\n3. Testing Fresh Migration (001_auth_tables.sql)...");
    await client.query(migrationSql);
    console.log("   [PASS] 001_auth_tables.sql executed successfully!");

    // Verify tables in sandbox
    const sandboxTables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${sandboxSchema}' ORDER BY table_name ASC`
    );
    const tableNames = sandboxTables.rows.map(r => r.table_name);
    console.log(`   Sandbox tables created (${tableNames.length}):`, tableNames);
    assert.ok(tableNames.includes("schema_migrations"));
    assert.ok(tableNames.includes("users"));
    assert.ok(tableNames.includes("accounts"));
    assert.ok(tableNames.includes("sessions"));
    assert.ok(tableNames.includes("user_saved_events"));

    // Verify token columns are NOT present in accounts table
    const tokenCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = '${sandboxSchema}' AND table_name = 'accounts' 
        AND column_name IN ('access_token', 'refresh_token', 'id_token');
    `);
    assert.strictEqual(tokenCols.rows.length, 0, "No token columns should exist in accounts table!");
    console.log("   [PASS] Verified zero OAuth token columns in accounts table.");

    // 3. Test Migration Rerun (Idempotency & Version Notice)
    console.log("\n4. Testing Migration Rerun...");
    await client.query(migrationSql);
    console.log("   [PASS] Rerun completed safely and validated schema compatibility!");

    // 4. Test Incompatible Schema Detection on Rerun
    console.log("\n5. Testing Incompatible Schema Detection...");
    await client.query(`ALTER TABLE ${sandboxSchema}.accounts ADD COLUMN access_token TEXT;`);
    let threwIncompatible = false;
    try {
      await client.query(migrationSql);
    } catch (err) {
      threwIncompatible = true;
      console.log(`   [PASS] Incompatible schema correctly rejected: ${err.message}`);
      await client.query("ROLLBACK;");
    }
    assert.strictEqual(threwIncompatible, true, "Rerun with corrupted schema must abort!");
    // Clean up artificial column
    await client.query(`ALTER TABLE ${sandboxSchema}.accounts DROP COLUMN access_token;`);

    // 5. Test Rollback Safety Abort when real users exist
    console.log("\n6. Testing Post-Launch Rollback Safety Abort...");
    await client.query(`
      INSERT INTO ${sandboxSchema}.users (id, name, email, primary_provider, created_at, last_sign_in_at)
      VALUES ('usr-test-safety', 'Active User', 'active@example.com', 'google', NOW(), NOW());
    `);
    let threwSafetyAbort = false;
    try {
      await client.query(rollbackSql);
    } catch (err) {
      threwSafetyAbort = true;
      console.log(`   [PASS] Destructive rollback safely aborted: ${err.message}`);
      await client.query("ROLLBACK;");
    }
    assert.strictEqual(threwSafetyAbort, true, "Rollback MUST abort if users table has rows!");

    // Verify users table still exists and data was preserved
    const preservedUser = await client.query(`SELECT id FROM ${sandboxSchema}.users WHERE id = 'usr-test-safety'`);
    assert.strictEqual(preservedUser.rows.length, 1, "User record must be preserved!");
    console.log("   [PASS] User record verified intact after aborted rollback.");

    // 6. Test Clean Rollback when 0 users exist (pre-launch condition)
    console.log("\n7. Testing Clean Rollback when 0 users exist...");
    await client.query(`DELETE FROM ${sandboxSchema}.users WHERE id = 'usr-test-safety';`);
    await client.query(rollbackSql);
    console.log("   [PASS] Rollback succeeded cleanly when 0 users existed!");

    const postRollbackTables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = '${sandboxSchema}' ORDER BY table_name ASC`
    );
    console.log("   Tables remaining in sandbox:", postRollbackTables.rows.map(r => r.table_name));
    assert.ok(!postRollbackTables.rows.map(r => r.table_name).includes("users"));
    assert.ok(!postRollbackTables.rows.map(r => r.table_name).includes("accounts"));

    // 7. Clean up sandbox
    console.log("\n8. Dropping isolated sandbox schema...");
    await client.query(`DROP SCHEMA ${sandboxSchema} CASCADE;`);
    await client.query(`SET search_path TO public;`);
    console.log("   [PASS] Sandbox schema dropped cleanly.");

    // 8. Confirm production public schema integrity
    console.log("\n9. Confirming public production schema integrity...");
    const finalPublicTables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name ASC"
    );
    assert.deepStrictEqual(
      finalPublicTables.rows.map(r => r.table_name),
      ["audit_logs", "events", "subscribers", "suggestions"],
      "Public schema must remain 100% untouched!"
    );

    const pubCount = await client.query("SELECT COUNT(*)::int as cnt FROM events WHERE publication_status = 'published'");
    const pendCount = await client.query("SELECT COUNT(*)::int as cnt FROM events WHERE publication_status = 'pending_review'");
    console.log(`   Public events: ${pubCount.rows[0].cnt} published, ${pendCount.rows[0].cnt} pending review`);
    assert.strictEqual(pubCount.rows[0].cnt, 9);
    assert.strictEqual(pendCount.rows[0].cnt, 10);
    console.log("   [PASS] All 9 published events and 10 pending events verified intact in Neon!");

    console.log("\n================================================================================");
    console.log("ALL NEON ISOLATED SANDBOX TESTS PASSED WITH 100% SUCCESS!");
    console.log("================================================================================\n");
  } finally {
    client.release();
    await pool.end();
  }
}

runNeonSandboxVerification().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
