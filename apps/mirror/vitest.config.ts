import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/__tests__/**/*.test.ts", "**/*.unit.test.ts"],
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: [
      {
        find: "@feel-good/convex/chat",
        replacement: path.resolve(
          __dirname,
          "../../packages/convex/convex/chat",
        ),
      },
      {
        find: "@feel-good/convex",
        replacement: path.resolve(__dirname, "../../packages/convex"),
      },
    ],
  },
});
