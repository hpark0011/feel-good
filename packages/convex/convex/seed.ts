import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { createThread, saveMessage } from "@convex-dev/agent";
import { components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// ── Seed data ───────────────────────────────────────────────────────

function tiptapDoc(paragraphs: string[]) {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: [{ type: "text", text }],
    })),
  };
}

const SEED_ARTICLES = [
  {
    slug: "the-art-of-listening",
    title: "The Art of Listening",
    category: "Music & Sound",
    daysAgo: 30,
    body: tiptapDoc([
      "Most people think producing music is about adding things. In my experience, the opposite is true. The best work comes from removing everything that isn't essential until only the truth remains.",
      "Listening is not passive. It requires your full attention, an emptying of expectation, and a willingness to be surprised. When you listen without judgment, the music tells you what it wants to be.",
      "Every great record I have been part of started with silence. Not the absence of sound, but the presence of attention.",
    ]),
  },
  {
    slug: "simplicity-as-a-superpower",
    title: "Simplicity as a Superpower",
    category: "Creativity",
    daysAgo: 18,
    body: tiptapDoc([
      "Complexity is easy. Anyone can pile ideas on top of each other until the result feels impressive. The difficult thing is knowing what to leave out.",
      "When I sit with an artist for the first time, I am not listening for what they can do. I am listening for who they are. The technical ability is the least interesting part. What matters is the thing underneath — the signal hiding in the noise.",
      "Simplicity is not about having less. It is about making room for what matters.",
    ]),
  },
  {
    slug: "nature-and-the-creative-process",
    title: "Nature and the Creative Process",
    category: "Creativity",
    daysAgo: 7,
    body: tiptapDoc([
      "I spend a lot of time outdoors. Not because it makes me more productive, but because it reminds me what creation actually looks like. A tree does not strain to grow. A wave does not try to break. These things happen because conditions allow them to.",
      "The creative process works the same way. You cannot force a great idea into existence. You can only create the conditions where great ideas are free to arrive.",
    ]),
  },
];

const SEED_POSTS = [
  {
    slug: "listening-before-speaking",
    title: "Listening Before Speaking",
    daysAgo: 5,
    body: tiptapDoc([
      "Most breakthroughs arrive after the room gets quiet enough to hear what was already there.",
    ]),
  },
  {
    slug: "remove-the-unnecessary",
    title: "Remove the Unnecessary",
    daysAgo: 3,
    body: tiptapDoc([
      "If the work feels crowded, it usually means the idea wants more space, not more decoration.",
    ]),
  },
  {
    slug: "make-the-room-safe",
    title: "Make the Room Safe",
    daysAgo: 1,
    body: tiptapDoc([
      "Artists do their best work when they do not feel judged while reaching for something new.",
    ]),
  },
];

const SEED_CONVERSATIONS = [
  {
    title: "What inspires your production style?",
    messages: [
      {
        role: "user" as const,
        text: "What inspires your production style?",
      },
      {
        role: "assistant" as const,
        text: "I would not call it a style exactly. It is more of a practice — stripping things down until only the essential remains. I learned early on that the most powerful music is often the simplest. A single voice, an honest lyric, a raw performance. My job is to protect that honesty and keep everything else from getting in the way.",
      },
    ],
  },
  {
    title: "How do you approach a new artist?",
    messages: [
      {
        role: "user" as const,
        text: "How do you approach working with a new artist for the first time?",
      },
      {
        role: "assistant" as const,
        text: "I start by listening. Not to their music — to them. Who they are, what they care about, what keeps them up at night. The music is a reflection of the person, so understanding the person comes first. I try to create an environment where they feel safe enough to be vulnerable. That is where the real work happens.",
      },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

async function ensureRickRubinUser(
  ctx: MutationCtx,
): Promise<Id<"users">> {
  const existing = await ctx.db
    .query("users")
    .withIndex("by_username", (q: any) => q.eq("username", "rick-rubin"))
    .unique();

  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("users", {
    authId: "seed_rick_rubin",
    email: "rick@example.com",
    username: "rick-rubin",
    name: "Rick Rubin",
    bio: "Rick Rubin has been a singular, transformative creative muse for artists across genres and generations — from the Beastie Boys to Johnny Cash, from Public Enemy to the Red Hot Chili Peppers, from Adele to Jay-Z.",
    onboardingComplete: true,
  });
}

async function ensureRickRubinArticles(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const existing = await ctx.db
    .query("articles")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  if (existing) {
    return;
  }

  const now = Date.now();
  for (const article of SEED_ARTICLES) {
    const createdAt = now - article.daysAgo * 24 * 60 * 60 * 1000;
    await ctx.db.insert("articles", {
      userId,
      slug: article.slug,
      title: article.title,
      category: article.category,
      body: article.body,
      status: "published",
      createdAt,
      publishedAt: createdAt,
    });
  }
}

async function ensureRickRubinPosts(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const existing = await ctx.db
    .query("posts")
    .withIndex("by_userId", (q: any) => q.eq("userId", userId))
    .first();
  if (existing) {
    return;
  }

  const now = Date.now();
  for (const post of SEED_POSTS) {
    const createdAt = now - post.daysAgo * 24 * 60 * 60 * 1000;
    await ctx.db.insert("posts", {
      userId,
      slug: post.slug,
      title: post.title,
      body: post.body,
      status: "published",
      createdAt,
      publishedAt: createdAt,
    });
  }
}

async function ensureRickRubinConversations(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const existing = await ctx.db
    .query("conversations")
    .withIndex("by_profileOwnerId_and_viewerId", (q: any) =>
      q.eq("profileOwnerId", userId),
    )
    .first();
  if (existing) {
    return;
  }

  for (const convo of SEED_CONVERSATIONS) {
    const threadId = await createThread(ctx, components.agent, {});

    await ctx.db.insert("conversations", {
      profileOwnerId: userId,
      threadId,
      status: "active",
      title: convo.title,
    });

    for (const msg of convo.messages) {
      if (msg.role === "user") {
        await saveMessage(ctx, components.agent, {
          threadId,
          prompt: msg.text,
        });
      } else {
        await saveMessage(ctx, components.agent, {
          threadId,
          message: {
            role: "assistant",
            content: [{ type: "text", text: msg.text }],
          },
        });
      }
    }
  }
}

// ── Exported mutations ──────────────────────────────────────────────

export const seedRickRubin = internalMutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ensureRickRubinUser(ctx);
  },
});

export const seedRickRubinArticles = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await ensureRickRubinUser(ctx);
    await ensureRickRubinArticles(ctx, userId);
    return null;
  },
});

export const seedRickRubinPosts = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await ensureRickRubinUser(ctx);
    await ensureRickRubinPosts(ctx, userId);
    return null;
  },
});

export const seedRickRubinConversations = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await ensureRickRubinUser(ctx);
    await ensureRickRubinConversations(ctx, userId);
    return null;
  },
});

export const seedRickRubinDemo = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await ensureRickRubinUser(ctx);
    await ensureRickRubinArticles(ctx, userId);
    await ensureRickRubinPosts(ctx, userId);
    await ensureRickRubinConversations(ctx, userId);
    return null;
  },
});
