"use client";

import React from "react";
import { PageTitle } from "@/components/page-title";

export default function BlocksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto relative">
      <main className="mx-auto min-h-screen">
        <div className="flex flex-col items-center py-12 px-4 w-full max-w-2xl mx-auto ">
          <div className="my-8 w-full">
            <PageTitle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
