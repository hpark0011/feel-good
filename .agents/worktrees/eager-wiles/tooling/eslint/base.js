import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import sharedRules from "./shared-rules.js";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      ...sharedRules,
      // Prevent non-null assertions (!) which can hide missing env var errors
      // Use explicit validation instead: if (!value) throw new Error(...)
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  }
);
