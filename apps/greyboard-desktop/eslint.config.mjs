import base from "@feel-good/eslint-config/base";

export default [
  ...base,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },
  {
    ignores: ["dist/**", "dist-electron/**", "release/**"],
  },
];
