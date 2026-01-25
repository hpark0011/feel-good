/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for production Electron builds
  output: process.env.ELECTRON_BUILD === "true" ? "standalone" : undefined,
  // Transpile workspace packages
  transpilePackages: ["@feel-good/ui", "@feel-good/utils", "@feel-good/icons"],
  // Skip ESLint and TypeScript checks during production builds
  // (these run in CI via separate lint/type-check commands)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

// Only load bundle analyzer when ANALYZE is true (dev only)
let config = nextConfig;
if (process.env.ANALYZE === "true") {
  const bundleAnalyzer = await import("@next/bundle-analyzer");
  const withBundleAnalyzer = bundleAnalyzer.default({
    enabled: true,
  });
  config = withBundleAnalyzer(nextConfig);
}

export default config;
