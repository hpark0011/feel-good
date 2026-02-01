"use client";

import React from "react";
import { ComponentsPageTitle } from "@/app/components/_components/components-page-title";

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto relative">
      <main className="mx-auto min-h-screen">
        <div className="flex flex-col items-center py-12 px-4 w-full max-w-2xl mx-auto ">
          <div className="my-8 w-full">
            <ComponentsPageTitle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
