/// <reference types="vite/client" />

// Set required env vars BEFORE any Convex module is imported. `convex/env.ts`
// validates these at module-load time and throws otherwise.
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
// relative path from the importing file, which gives mixed prefixes when
// the test lives in a nested __tests__/ dir. `convex-test` needs a single
// uniform prefix rooted at the `_generated/` entry, so we rewrite every
// key to start with `../../<dir>/...` (relative to the convex/ root when
// viewed from here).
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

describe("betaAllowlist queries + mutations", () => {
  it("addAllowlistEntry inserts exactly one row and is idempotent on duplicates", async () => {
    const t = makeT();
    await t.mutation(internal.betaAllowlist.mutations.addAllowlistEntry, {
      email: "dup@example.com",
    });
    await t.mutation(internal.betaAllowlist.mutations.addAllowlistEntry, {
      email: "dup@example.com",
    });

    const rows = await t.run(async (ctx) =>
      ctx.db.query("betaAllowlist").collect(),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("dup@example.com");
  });

  it("isEmailAllowed matches case-insensitively in both directions", async () => {
    const t = makeT();
    await t.mutation(internal.betaAllowlist.mutations.addAllowlistEntry, {
      email: "foo@bar.com",
    });

    const allowed = await t.query(
      internal.betaAllowlist.queries.isEmailAllowed,
      { email: "Foo@BAR.com" },
    );
    expect(allowed).toBe(true);
  });

  it("isEmailAllowed returns false for an unknown email", async () => {
    const t = makeT();
    const allowed = await t.query(
      internal.betaAllowlist.queries.isEmailAllowed,
      { email: "nobody@example.com" },
    );
    expect(allowed).toBe(false);
  });

  it("removeAllowlistEntry deletes the row; subsequent isEmailAllowed is false", async () => {
    const t = makeT();
    await t.mutation(internal.betaAllowlist.mutations.addAllowlistEntry, {
      email: "gone@example.com",
    });
    await t.mutation(internal.betaAllowlist.mutations.removeAllowlistEntry, {
      email: "Gone@Example.com",
    });

    const allowed = await t.query(
      internal.betaAllowlist.queries.isEmailAllowed,
      { email: "gone@example.com" },
    );
    expect(allowed).toBe(false);

    const rows = await t.run(async (ctx) =>
      ctx.db.query("betaAllowlist").collect(),
    );
    expect(rows).toHaveLength(0);
  });

  it("addAllowlistEntry stores email lowercased", async () => {
    const t = makeT();
    await t.mutation(internal.betaAllowlist.mutations.addAllowlistEntry, {
      email: "MiXeD@CaSe.com",
      note: "beta-tester",
    });

    const rows = await t.run(async (ctx) =>
      ctx.db.query("betaAllowlist").collect(),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("mixed@case.com");
    expect(rows[0].note).toBe("beta-tester");
    expect(typeof rows[0].addedAt).toBe("number");
  });
});
