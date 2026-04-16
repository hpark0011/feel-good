/// <reference types="vite/client" />

// Env setup BEFORE any Convex module is imported. `convex/env.ts` validates
// these at module-load time and throws otherwise; `auth/client.ts`
// transitively imports it, and the convex-test module glob evaluates it.
process.env.SITE_URL = process.env.SITE_URL ?? "https://test.local";
process.env.GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ?? "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET ?? "test-google-client-secret";

import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { internal } from "../../_generated/api";
import schema from "../../schema";

// Vite's `import.meta.glob` normalizes keys to the shortest possible
// relative path from the importing file. convex-test needs a single uniform
// prefix rooted at the `_generated/` entry, so rewrite every key to start
// with `../../<dir>/...` (the convex/ root when viewed from here).
function normalizeConvexGlob(
  raw: Record<string, () => Promise<unknown>>,
): Record<string, () => Promise<unknown>> {
  const out: Record<string, () => Promise<unknown>> = {};
  for (const [key, loader] of Object.entries(raw)) {
    let k = key;
    if (k.startsWith("./")) {
      k = "../../betaAllowlist/__tests__/" + k.slice(2);
    } else if (k.startsWith("../") && !k.startsWith("../../")) {
      k = "../../betaAllowlist/" + k.slice(3);
    }
    out[k] = loader;
  }
  return out;
}

const rawModules = import.meta.glob("../../**/*.{ts,js}");
const modules = normalizeConvexGlob(rawModules);

function makeT() {
  return convexTest(schema, modules);
}

// ---------------------------------------------------------------------------
// FR-05: Tier 1 `triggers.user.onCreate` gate.
//
// The trigger callback is wired via `authComponent.triggersApi()` and
// exposed at `internal.auth.triggers.onCreate`. Invoking that mutation
// directly drives the exact same callback that the `@convex-dev/better-auth`
// component's `adapter.create` mutation invokes via `ctx.runMutation` with
// `{ model, doc }`. An uncaught throw inside the trigger aborts the enclosing
// mutation atomically, which in production rolls back the component's user
// row; here we can't observe the component user table without registering
// the `@convex-dev/better-auth` component in convex-test, but we CAN observe
// the app `users` table — which is what the trigger itself writes to.
// Because the throw occurs BEFORE `ctx.db.insert("users", ...)`, the app
// users table stays empty for off-allowlist emails (verifying the "no app
// rows created" half of FR-05). The component-side rollback is a property
// of `@convex-dev/better-auth`'s unwrapping of `ctx.runMutation` errors and
// is not re-tested here.
// ---------------------------------------------------------------------------

describe("triggers.user.onCreate allowlist gate (Tier 1)", () => {
  it("off-allowlist email throws and leaves the app users table empty", async () => {
    const t = makeT();

    // Fake component-user doc shape — only `_id` and `email` are read by
    // the trigger callback (see `auth/client.ts`). Email is NOT on the
    // allowlist, so the gate must throw before `ctx.db.insert("users", ...)`.
    const doc = {
      _id: "auth_user_off_allowlist",
      email: "stranger@example.com",
    };

    await expect(
      t.mutation(internal.auth.triggers.onCreate, {
        model: "user",
        doc,
      }),
    ).rejects.toThrow(/BETA_CLOSED/);

    const rows = await t.run(async (ctx) =>
      ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), doc.email))
        .collect(),
    );
    expect(rows).toHaveLength(0);
  });

  it("allowlisted email succeeds and inserts exactly one app users row", async () => {
    const t = makeT();

    // Seed the allowlist via the internal mutation (same path dashboard
    // operators use per US-7).
    await t.mutation(internal.betaAllowlist.mutations.addAllowlistEntry, {
      email: "invited@example.com",
    });

    const doc = {
      _id: "auth_user_invited",
      email: "invited@example.com",
    };

    await t.mutation(internal.auth.triggers.onCreate, {
      model: "user",
      doc,
    });

    const rows = await t.run(async (ctx) =>
      ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), doc.email))
        .collect(),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].authId).toBe(doc._id);
    expect(rows[0].onboardingComplete).toBe(false);
  });
});
