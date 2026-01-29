import React from "react";

interface UIFactoryLayoutProps {
  children: React.ReactNode;
}

export default function UIFactoryLayout(
  { children }: UIFactoryLayoutProps,
) {
  return <div className="mx-auto">{children}</div>;
}
