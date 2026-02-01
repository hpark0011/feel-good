"use client";

import React from "react";
import { usePageTitle } from "@/app/components/_hooks/use-page-title";

export function PageTitle() {
  const pageTitle = usePageTitle();

  return <div className="text-2xl font-medium w-full">{pageTitle}</div>;
}
