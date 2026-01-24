import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Enable standalone output for production Electron builds
  output: process.env.ELECTRON_BUILD === "true" ? "standalone" : undefined,
  // Transpile workspace packages
  transpilePackages: ["@feel-good/ui", "@feel-good/utils", "@feel-good/icons"],
  // Skip ESLint and TypeScript checks during production builds
  // (these run in CI via separate lint/type-check commands)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default withBundleAnalyzer(nextConfig);
