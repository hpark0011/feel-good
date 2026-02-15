import { build } from 'esbuild'
import { createServer } from 'vite'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import electronPath from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const sharedEsbuild = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: ['electron'],
  outdir: path.resolve(root, 'dist-electron'),
  outExtension: { '.js': '.cjs' },
  format: 'cjs',
  logLevel: 'info',
}

let electronProcess = null

function startElectron() {
  if (electronProcess) {
    electronProcess.kill()
    electronProcess = null
  }

  electronProcess = spawn(String(electronPath), [path.resolve(root, 'dist-electron/main.cjs')], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' },
  })

  electronProcess.on('close', (code) => {
    if (code !== null) {
      process.exit(code)
    }
  })
}

// 1. Start Vite dev server
const viteServer = await createServer({
  root,
  server: { port: 5173 },
})
await viteServer.listen()
const viteUrl = viteServer.resolvedUrls?.local?.[0] ?? 'http://localhost:5173'
process.env.VITE_DEV_SERVER_URL = viteUrl

console.log(`Vite dev server running at ${viteUrl}`)

// 2. Build electron main + preload with watch
await build({
  ...sharedEsbuild,
  entryPoints: [
    path.resolve(root, 'electron/main.ts'),
    path.resolve(root, 'electron/preload.ts'),
  ],
  define: {
    'process.env.VITE_DEV_SERVER_URL': JSON.stringify(viteUrl),
  },
  plugins: [
    {
      name: 'restart-electron',
      setup(build) {
        build.onEnd(() => {
          startElectron()
        })
      },
    },
  ],
  watch: true,
})
