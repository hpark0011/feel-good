"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-2xl px-4 py-16">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to profile
        </Link>
        <h1 className="text-2xl font-semibold mt-6">{slug}</h1>
        <p className="text-muted-foreground mt-4">
          Article detail page — coming soon.
        </p>
      </main>
    </div>
  );
}
