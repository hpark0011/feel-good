import { NavHeader } from "@/app/_components/nav-header";
import React from "react";

export default function ComponentsLayout(
  { children }: { children: React.ReactNode },
) {
  return (
    <div>
      <NavHeader />
      <main>{children}</main>
    </div>
  );
}
