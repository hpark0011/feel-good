/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@feel-good/greyboard-core",
    "@feel-good/icons",
    "@feel-good/ui",
    "@feel-good/utils",
  ],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
