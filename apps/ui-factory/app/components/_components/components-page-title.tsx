"use client";

import React from "react";
import { useComponentsPageTitle } from "@/app/components/_hooks/use-components-page-title";

export function ComponentsPageTitle() {
  const componentsPageTitle = useComponentsPageTitle();

  return (
    <div className="text-2xl font-medium w-full">{componentsPageTitle}</div>
  );
}
