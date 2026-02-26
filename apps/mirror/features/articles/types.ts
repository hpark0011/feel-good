import type { Id } from "@feel-good/convex/convex/_generated/dataModel";
import type { JSONContent } from "@feel-good/features/editor/types";

export type Article = {
  _id: Id<"articles">;
  _creationTime: number;
  userId: Id<"users">;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  createdAt: number;
  publishedAt?: number;
  status: "draft" | "published";
  category: string;
  body: JSONContent;
};
