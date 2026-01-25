const nextConfig = {
  // Enable standalone output for production Electron builds
  output: process.env.ELECTRON_BUILD === "true" ? "standalone" : undefined,
  // Transpile workspace packages (icons is pre-built, doesn't need transpilation)
  transpilePackages: ["@feel-good/utils"],
  // Skip ESLint and TypeScript checks during production builds
  // (these run in CI via separate lint/type-check commands)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
