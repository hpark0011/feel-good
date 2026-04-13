import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth/client";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// Test-only routes: guarded on x-test-secret header matching PLAYWRIGHT_TEST_SECRET.
// These routes are always registered but reject all requests when the env var is absent.

http.route({
  path: "/test/read-otp",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.PLAYWRIGHT_TEST_SECRET;
    const header = req.headers.get("x-test-secret");
    if (!secret || !header || header !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
    const { email } = (await req.json()) as { email: string };
    if (!email) {
      return new Response("Bad Request: email required", { status: 400 });
    }
    const otp: string | null = await ctx.runQuery(
      internal.auth.testHelpers.readTestOtp,
      { email }
    );
    if (otp === null) {
      return new Response(JSON.stringify({ error: "OTP not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ otp }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/test/ensure-user",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.PLAYWRIGHT_TEST_SECRET;
    const header = req.headers.get("x-test-secret");
    if (!secret || !header || header !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
    const { email, username } = (await req.json()) as {
      email: string;
      username: string;
    };
    if (!email || !username) {
      return new Response("Bad Request: email and username required", {
        status: 400,
      });
    }
    await ctx.runMutation(internal.auth.testHelpers.ensureTestUser, {
      email,
      username,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
