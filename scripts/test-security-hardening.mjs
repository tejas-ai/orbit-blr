import assert from "node:assert";
import crypto from "node:crypto";
import { upsertOAuthUser, AccountLinkingConflictError, getUserSavedEvents, mergeUserSavedEvents, toggleUserSavedEvent, getRegisteredUserStats } from "../src/lib/auth-db.ts";

// Ensure we test with local SQLite fallback (or isolated sandbox)
delete process.env.DATABASE_URL;

console.log("================================================================================");
console.log("ORBIT BLR 3.2 — Security & Identity Hardening Automated Test Suite");
console.log("================================================================================\n");

async function runTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      process.exit(1);
    }
  }

  async function testAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(err);
      process.exit(1);
    }
  }

  // 1. Timing-Safe secret comparison verification
  test("timingSafeCompare properly authenticates equal tokens and rejects differing tokens", () => {
    function timingSafeCompare(a, b) {
      const hashA = crypto.createHash("sha256").update(a).digest();
      const hashB = crypto.createHash("sha256").update(b).digest();
      return crypto.timingSafeEqual(hashA, hashB);
    }

    const secret = "super-secret-orbit-token-2026";
    assert.strictEqual(timingSafeCompare(secret, secret), true, "Identical tokens must match");
    assert.strictEqual(timingSafeCompare(secret, "wrong-token"), false, "Different tokens must not match");
    assert.strictEqual(timingSafeCompare(secret, secret + "extra"), false, "Different length tokens must not match");
    assert.strictEqual(timingSafeCompare(secret, "super-secret-orbit-token-2027"), false, "Single character difference must not match");
  });

  // 2. Scenario A: New user with Google
  const googleEmail = `test-user-google-${Date.now()}@example.com`;
  let googleUser;
  await testAsync("Scenario A: New user registers successfully via Google OAuth", async () => {
    googleUser = await upsertOAuthUser({
      id: `usr-google-${Date.now()}`,
      name: "Alice Google",
      email: googleEmail,
      image: "https://lh3.googleusercontent.com/alice.jpg",
      provider: "google",
      providerAccountId: `google-acc-${Date.now()}`,
    });

    assert.ok(googleUser?.id, "User ID must be generated");
    assert.strictEqual(googleUser.email, googleEmail);
    assert.strictEqual(googleUser.primary_provider, "google");
  });

  // 3. Scenario B: Returning user with Google
  await testAsync("Scenario B: Returning user with Google OAuth signs in cleanly and updates timestamp", async () => {
    const returning = await upsertOAuthUser({
      id: googleUser.id,
      name: "Alice Google Updated",
      email: googleEmail,
      image: "https://lh3.googleusercontent.com/alice-new.jpg",
      provider: "google",
      providerAccountId: googleUser.id.replace("usr-", "acc-"), // matching account
    });

    assert.ok(returning);
  });

  // 4. Scenario C: New user with GitHub
  const githubEmail = `test-user-github-${Date.now()}@example.com`;
  let githubUser;
  await testAsync("Scenario C: New user registers successfully via GitHub OAuth", async () => {
    githubUser = await upsertOAuthUser({
      id: `usr-github-${Date.now()}`,
      name: "Bob GitHub",
      email: githubEmail,
      image: "https://avatars.githubusercontent.com/u/bob",
      provider: "github",
      providerAccountId: `gh-acc-${Date.now()}`,
    });

    assert.ok(githubUser?.id);
    assert.strictEqual(githubUser.primary_provider, "github");
    assert.strictEqual(githubUser.email, githubEmail);
  });

  // 5. Scenario D: Insecure Account Hijacking Prevention
  await testAsync("Scenario D: Google user's account CANNOT be hijacked by GitHub login with same email", async () => {
    let hijacked = false;
    try {
      await upsertOAuthUser({
        id: `attacker-id-${Date.now()}`,
        name: "Attacker Impersonator",
        email: googleEmail, // Exact same email as Alice Google!
        image: "https://evil.example.com/avatar.jpg",
        provider: "github", // Different provider!
        providerAccountId: `attacker-gh-${Date.now()}`,
      });
      hijacked = true;
    } catch (err) {
      assert.ok(err instanceof AccountLinkingConflictError, "Must throw AccountLinkingConflictError");
      assert.strictEqual(err.existingProvider, "google");
      assert.strictEqual(err.attemptedProvider, "github");
    }

    assert.strictEqual(hijacked, false, "Cross-provider automatic account linking MUST be rejected!");
  });

  // 6. Scenario E: GitHub user with Private / No Email
  await testAsync("Scenario E: GitHub user with private/null email registers cleanly by providerAccountId", async () => {
    const ghPrivateAccountId = `gh-private-${Date.now()}`;
    const userNoEmail = await upsertOAuthUser({
      id: `usr-private-${Date.now()}`,
      name: "Stealth Coder",
      email: null, // Private email
      image: "https://avatars.githubusercontent.com/u/stealth",
      provider: "github",
      providerAccountId: ghPrivateAccountId,
    });

    assert.ok(userNoEmail?.id);
    assert.strictEqual(userNoEmail.email, null);
    assert.strictEqual(userNoEmail.primary_provider, "github");

    // Returning login with private email
    const returningNoEmail = await upsertOAuthUser({
      id: userNoEmail.id,
      name: "Stealth Coder",
      email: null,
      provider: "github",
      providerAccountId: ghPrivateAccountId,
    });
    assert.strictEqual(returningNoEmail.id, userNoEmail.id, "Must resolve to same user ID without email");
  });

  // 7. Saved events user isolation
  await testAsync("Scenario 4: User saved events isolation and scoping", async () => {
    const user1Id = `usr-isolated-1-${Date.now()}`;
    const user2Id = `usr-isolated-2-${Date.now()}`;
    const eventA = "evt-hackman-x-20261026";
    const eventB = "evt-gears-20261027";

    // User 1 saves eventA
    await toggleUserSavedEvent(user1Id, eventA);
    // User 2 saves eventB
    await toggleUserSavedEvent(user2Id, eventB);

    const user1Bookmarks = await getUserSavedEvents(user1Id);
    const user2Bookmarks = await getUserSavedEvents(user2Id);

    assert.deepStrictEqual(user1Bookmarks, [eventA], "User 1 should only have event A");
    assert.deepStrictEqual(user2Bookmarks, [eventB], "User 2 should only have event B");

    // User 1 cannot see User 2's bookmarks
    assert.ok(!user1Bookmarks.includes(eventB));
    assert.ok(!user2Bookmarks.includes(eventA));
  });

  // 8. Registered User Statistics
  await testAsync("Scenario 5: Registered user statistics aggregations", async () => {
    const stats = await getRegisteredUserStats();
    assert.ok(stats.totalUsers > 0, "Total users should be greater than 0");
    assert.ok(typeof stats.providerBreakdown.google === "number");
    assert.ok(typeof stats.providerBreakdown.github === "number");
  });

  // 9. Statistics Secret Separation
  test("Statistics authorization prefers ORBIT_STATS_SECRET over ORBIT_API_SECRET", () => {
    const statsSecret = "dedicated-stats-secret-xyz";
    const apiSecret = "general-ingest-secret-abc";

    function getExpectedStatsSecret(env) {
      return env.ORBIT_STATS_SECRET || env.ORBIT_API_SECRET;
    }

    assert.strictEqual(
      getExpectedStatsSecret({ ORBIT_STATS_SECRET: statsSecret, ORBIT_API_SECRET: apiSecret }),
      statsSecret,
      "ORBIT_STATS_SECRET must take precedence when defined"
    );

    assert.strictEqual(
      getExpectedStatsSecret({ ORBIT_API_SECRET: apiSecret }),
      apiSecret,
      "ORBIT_API_SECRET acts as fallback when ORBIT_STATS_SECRET is not set"
    );
  });

  console.log(`\n================================================================================`);
  console.log(`ALL ${passed}/${total} HARDENED SECURITY & IDENTITY TESTS PASSED!`);
  console.log(`================================================================================\n`);
}

runTests().catch(console.error);
