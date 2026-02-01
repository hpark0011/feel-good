"use client";

import React from "react";
import { usePageTitle } from "@/app/components/_hooks/use-page-title";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageTitle = usePageTitle();

  return (
    <div className="mx-auto relative">
      <main className="mx-auto min-h-screen">
        <div className="flex flex-col items-center py-[80px] px-4 w-full">
          <div className="text-lg font-medium w-full">{pageTitle}</div>
          {children}
        </div>
      </main>
    </div>
  );
}
