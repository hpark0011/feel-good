import fs from "node:fs";
import path from "node:path";

// #region agent log
fetch("http://127.0.0.1:7246/ingest/0f061f98-4f3b-442d-8089-b6671f4a1f66", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    location: "next.config.mjs:4",
    message: "next.config cwd + dir",
    data: { cwd: process.cwd(), dir: path.resolve(".") },
    timestamp: Date.now(),
    sessionId: "debug-session",
    runId: "pre-fix",
    hypothesisId: "A",
  }),
}).catch(() => {});
// #endregion

const tsconfigPath = path.resolve("tsconfig.json");
let tsconfigJson;
try {
  tsconfigJson = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
} catch {
  tsconfigJson = null;
}

// #region agent log
fetch("http://127.0.0.1:7246/ingest/0f061f98-4f3b-442d-8089-b6671f4a1f66", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    location: "next.config.mjs:22",
    message: "tsconfig baseUrl + paths",
    data: {
      tsconfigPath,
      baseUrl: tsconfigJson?.compilerOptions?.baseUrl ?? null,
      paths: tsconfigJson?.compilerOptions?.paths ?? null,
    },
    timestamp: Date.now(),
    sessionId: "debug-session",
    runId: "pre-fix",
    hypothesisId: "A",
  }),
}).catch(() => {});
// #endregion

const uiButtonPath = path.resolve("components/ui/button.tsx");
const uiDialogPath = path.resolve("components/ui/dialog.tsx");
const uiFormPath = path.resolve("components/ui/form.tsx");
const uiInputPath = path.resolve("components/ui/input.tsx");
const uiTabsPath = path.resolve("components/ui/tabs.tsx");

// #region agent log
fetch("http://127.0.0.1:7246/ingest/0f061f98-4f3b-442d-8089-b6671f4a1f66", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    location: "next.config.mjs:47",
    message: "ui component existence",
    data: {
      uiButton: fs.existsSync(uiButtonPath),
      uiDialog: fs.existsSync(uiDialogPath),
      uiForm: fs.existsSync(uiFormPath),
      uiInput: fs.existsSync(uiInputPath),
      uiTabs: fs.existsSync(uiTabsPath),
    },
    timestamp: Date.now(),
    sessionId: "debug-session",
    runId: "pre-fix",
    hypothesisId: "C",
  }),
}).catch(() => {});
// #endregion

// #region agent log
fetch("http://127.0.0.1:7246/ingest/0f061f98-4f3b-442d-8089-b6671f4a1f66", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    location: "next.config.mjs:70",
    message: "resolved ui paths",
    data: {
      uiButtonPath,
      uiDialogPath,
      uiFormPath,
      uiInputPath,
      uiTabsPath,
    },
    timestamp: Date.now(),
    sessionId: "debug-session",
    runId: "pre-fix",
    hypothesisId: "B",
  }),
}).catch(() => {});
// #endregion

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
