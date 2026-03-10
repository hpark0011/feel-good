"use client";

import { BookFlip } from "@/components/animated-geometries/book-flip";

export function MirrorLogo() {
  return (
    <div className="bg-gray-6 rounded-t-full">
      <BookFlip className="size-[32px]" />
    </div>
  );
}
